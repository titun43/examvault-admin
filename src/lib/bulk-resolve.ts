// =============================================================================
// ExamVault - Admin > Bulk Import name-resolution helpers
// =============================================================================
// Lets bulk-add templates link to parents by NAME instead of by Firestore doc
// ID. This is what makes the top-down workflow actually usable:
//
//   1. Categories template   -> add SSC, WBCS                (no parent)
//   2. Subjects template     -> categoryName:"SSC"           (resolves to SSC's id)
//   3. Tests template        -> subjectName:"Quant", categoryName:"SSC"
//   4. Questions template    -> testTitle:"SSC Mock 1", subjectName:"Quant", categoryName:"SSC"
//
// All resolvers are BACKWARD COMPATIBLE: if the row already has the explicit
// ID field (categoryId / subjectId / testId), that wins and no lookup happens.
//
// All resolvers are CASE-INSENSITIVE on names and TRIM whitespace, because
// humans type "SSC" / "ssc " / "SSC " and expect them all to match.
//
// Resolutions are CACHED per-collection for the lifetime of a single bulk
// import call, so a 100-row import only hits Firestore once per parent
// collection.
// =============================================================================

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResolveResult<T> {
  /** The resolved doc id, or null if not found. */
  id: string | null;
  /** The human-readable name that was looked up (for error messages). */
  query: string;
  /** The collection the lookup happened in. */
  kind: T;
}

export interface BulkResolveReport {
  /** Rows that resolved successfully. */
  resolved: number;
  /** Rows that were skipped because a parent name couldn't be resolved. */
  skipped: { row: number; reason: string; raw: unknown }[];
}

// ---------------------------------------------------------------------------
// In-memory caches (per-session). Cleared only on page reload.
// We don't use onSnapshot here because bulk-resolve is a one-shot read — the
// admin clicks "Validate & Import", we read once, we cache for the call.
// ---------------------------------------------------------------------------

interface CategoryDoc {
  id: string;
  name: string;
}
interface SubjectDoc {
  id: string;
  name: string;
  categoryId: string;
}
interface TestDoc {
  id: string;
  title: string;
  subjectId: string;
}

let categoryCache: CategoryDoc[] | null = null;
let subjectCache: SubjectDoc[] | null = null;
let testCache: TestDoc[] | null = null;

/** Drop the caches. Useful if a bulk import just added parents and a
 *  subsequent import in the same session needs to see them. */
export function invalidateBulkResolveCaches() {
  categoryCache = null;
  subjectCache = null;
  testCache = null;
}

async function loadCategories(): Promise<CategoryDoc[]> {
  if (categoryCache) return categoryCache;
  const snap = await getDocs(collection(db, 'categories'));
  const list = snap.docs.map((d) => {
    const data = d.data() as { name?: string };
    return { id: d.id, name: (data.name ?? '').trim() };
  });
  categoryCache = list;
  return list;
}

async function loadSubjects(): Promise<SubjectDoc[]> {
  if (subjectCache) return subjectCache;
  const snap = await getDocs(collection(db, 'subjects'));
  const list = snap.docs.map((d) => {
    const data = d.data() as { name?: string; categoryId?: string };
    return {
      id: d.id,
      name: (data.name ?? '').trim(),
      categoryId: data.categoryId ?? '',
    };
  });
  subjectCache = list;
  return list;
}

async function loadTests(): Promise<TestDoc[]> {
  if (testCache) return testCache;
  const snap = await getDocs(collection(db, 'tests'));
  const list = snap.docs.map((d) => {
    const data = d.data() as { title?: string; subjectId?: string };
    return {
      id: d.id,
      title: (data.title ?? '').trim(),
      subjectId: data.subjectId ?? '',
    };
  });
  testCache = list;
  return list;
}

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

const norm = (s: unknown): string =>
  String(s ?? '').trim().toLowerCase();

// ---------------------------------------------------------------------------
// Public resolvers
// ---------------------------------------------------------------------------

/**
 * Resolve a category by name. Case-insensitive, whitespace-trimmed.
 * Returns the doc id, or null if no match.
 */
export async function resolveCategoryIdByName(
  name: string,
): Promise<ResolveResult<'category'>> {
  const target = norm(name);
  const cats = await loadCategories();
  const hit = cats.find((c) => norm(c.name) === target);
  return { id: hit?.id ?? null, query: String(name), kind: 'category' };
}

/**
 * Resolve a subject by name. If categoryName is provided, the subject must
 * belong to that category (disambiguates "Mathematics" existing in both SSC
 * and WBCS). Case-insensitive, whitespace-trimmed.
 */
export async function resolveSubjectIdByName(
  name: string,
  categoryName?: string,
): Promise<ResolveResult<'subject'>> {
  const target = norm(name);
  const subs = await loadSubjects();
  let pool = subs;
  if (categoryName) {
    const cat = await resolveCategoryIdByName(categoryName);
    if (!cat.id) {
      return { id: null, query: `${name} (in ${categoryName})`, kind: 'subject' };
    }
    pool = subs.filter((s) => s.categoryId === cat.id);
  }
  const hit = pool.find((s) => norm(s.name) === target);
  return { id: hit?.id ?? null, query: categoryName ? `${name} (in ${categoryName})` : name, kind: 'subject' };
}

/**
 * Resolve a test by title. If subjectName is provided, the test must belong
 * to that subject. If categoryName is also provided, the subject must belong
 * to that category (further disambiguation).
 */
export async function resolveTestIdByName(
  title: string,
  subjectName?: string,
  categoryName?: string,
): Promise<ResolveResult<'test'>> {
  const target = norm(title);
  const tests = await loadTests();
  let pool = tests;
  if (subjectName) {
    const subj = await resolveSubjectIdByName(subjectName, categoryName);
    if (!subj.id) {
      return {
        id: null,
        query: categoryName ? `${title} (in ${subjectName} / ${categoryName})` : `${title} (in ${subjectName})`,
        kind: 'test',
      };
    }
    pool = tests.filter((t) => t.subjectId === subj.id);
  }
  const hit = pool.find((t) => norm(t.title) === target);
  return {
    id: hit?.id ?? null,
    query: subjectName ? `${title} (in ${subjectName})` : title,
    kind: 'test',
  };
}

// ---------------------------------------------------------------------------
// Convenience: bulk-validate a list of rows WITHOUT writing anything.
// Returns the list of (row, resolved-id-or-null) pairs so the caller can
// show a preview / refuse to import if any parent is missing.
// ---------------------------------------------------------------------------

export type ParentKind = 'category' | 'subject' | 'test';

export interface BulkValidationRow {
  rowIndex: number;
  /** The parent name as it appeared in the row (for the report). */
  parentName: string;
  /** Resolved id, or null if not found. */
  resolvedId: string | null;
}

/**
 * Validate every row's parent reference. `getParentRef(row)` should return
 * `{ kind, name, contextName? }` where contextName is the optional
 * disambiguator (e.g. categoryName for a subject lookup).
 *
 * Returns one entry per row that HAS a name-based reference. Rows that use
 * explicit IDs (no name lookup needed) are not included.
 */
export async function validateParentRefs<T>(
  rows: T[],
  getParentRef: (row: T) =>
    | { kind: ParentKind; name: string; contextName?: string }
    | null,
): Promise<BulkValidationRow[]> {
  const out: BulkValidationRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    const ref = getParentRef(rows[i]);
    if (!ref) continue;
    let id: string | null = null;
    if (ref.kind === 'category') {
      id = (await resolveCategoryIdByName(ref.name)).id;
    } else if (ref.kind === 'subject') {
      id = (await resolveSubjectIdByName(ref.name, ref.contextName)).id;
    } else {
      id = (await resolveTestIdByName(ref.name, ref.contextName)).id;
    }
    out.push({
      rowIndex: i,
      parentName: ref.contextName
        ? `${ref.name} (in ${ref.contextName})`
        : ref.name,
      resolvedId: id,
    });
  }
  return out;
}
