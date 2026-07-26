// =============================================================================
// ExamVault — Direct Firestore count sync (server-side, no UI, no admin login)
// =============================================================================
// The Flutter user app reads 3 denormalized count fields directly from each
// document:
//   - category.subjectCount
//   - subject.testCount
//   - test.questionCount
//
// These fields drift whenever a child is added/deleted through an admin code
// path that forgets to write back the parent count. This script repairs ALL
// stale counts in one pass, using the bot admin account that was created
// earlier (worklog: seed-firestore-direct-success).
//
// Auth: signs in via Firebase Auth REST API (email/password) → idToken →
// Firestore REST API reads + patches. No service account needed.
//
// Idempotent: safe to run multiple times — only stale docs are patched.
// =============================================================================

const FIREBASE_API_KEY = 'AIzaSyBKEUGs9r7Q71q7vCIh3Pz_mletXQCok6E';
const PROJECT_ID = 'examvaultnew';
const BOT_EMAIL = 'seedbot_1784986656@examvault.com';
const BOT_PASSWORD = 'SeedBot@2025';

const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

interface AuthResponse {
  idToken: string;
  localId: string;
  email: string;
}

async function signIn(): Promise<string> {
  console.log(`[auth] signing in as ${BOT_EMAIL}…`);
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: BOT_EMAIL,
      password: BOT_PASSWORD,
      returnSecureToken: true,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Auth failed (${res.status}): ${errText}`);
  }
  const data = (await res.json()) as AuthResponse;
  console.log(`[auth] OK — uid=${data.localId}`);
  return data.idToken;
}

async function listCollection(idToken: string, name: string): Promise<Array<{ id: string; fields: Record<string, any> }>> {
  const url = `${FIRESTORE_BASE}/${name}?pageSize=1000`;
  const all: Array<{ id: string; fields: Record<string, any> }> = [];
  let nextPageToken: string | undefined;
  do {
    const pagedUrl = nextPageToken ? `${url}&pageToken=${nextPageToken}` : url;
    const res = await fetch(pagedUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`list ${name} failed (${res.status}): ${errText}`);
    }
    const data = await res.json();
    const docs = data.documents || [];
    for (const d of docs) {
      // d.name = "projects/.../documents/{col}/{id}"
      const id = d.name.split('/').pop();
      all.push({ id, fields: d.fields || {} });
    }
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);
  return all;
}

// Firestore REST API returns values wrapped in type objects, e.g. { integerValue: "5" }
// or { stringValue: "x" } or { booleanValue: true }. Unwrap to JS primitive.
function unwrap(v: any): any {
  if (v === null || v === undefined) return undefined;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(unwrap);
  if ('mapValue' in v) {
    const obj: Record<string, any> = {};
    for (const [k, val] of Object.entries(v.mapValue.fields || {})) obj[k] = unwrap(val);
    return obj;
  }
  return undefined;
}

// Build a Firestore REST patch body: { fields: { fieldName: { integerValue: "5" } } }
// Only primitive values here (numbers + timestamps).
function wrapNumber(n: number) {
  return { integerValue: String(n) };
}

async function patchDoc(
  idToken: string,
  collection: string,
  id: string,
  fields: Record<string, any>,
): Promise<void> {
  const url = `${FIRESTORE_BASE}/${collection}/${id}?updateMask.fieldPaths=${Object.keys(fields).join('&updateMask.fieldPaths=')}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`patch ${collection}/${id} failed (${res.status}): ${errText}`);
  }
}

async function main() {
  const idToken = await signIn();

  console.log('\n[fetch] loading subjects, tests, questions, categories…');
  const [subjects, tests, questions, categories] = await Promise.all([
    listCollection(idToken, 'subjects'),
    listCollection(idToken, 'tests'),
    listCollection(idToken, 'questions'),
    listCollection(idToken, 'categories'),
  ]);
  console.log(`[fetch] subjects=${subjects.length}, tests=${tests.length}, questions=${questions.length}, categories=${categories.length}`);

  // Build count maps in ONE pass each — O(n) instead of O(n²)
  const testCountBySubject: Record<string, number> = {};
  const questionCountByTest: Record<string, number> = {};
  const subjectCountByCategory: Record<string, number> = {};

  for (const t of tests) {
    const sid = unwrap(t.fields.subjectId);
    if (sid) testCountBySubject[sid] = (testCountBySubject[sid] || 0) + 1;
  }
  for (const q of questions) {
    const tid = unwrap(q.fields.testId);
    if (tid) questionCountByTest[tid] = (questionCountByTest[tid] || 0) + 1;
  }
  for (const s of subjects) {
    const cid = unwrap(s.fields.categoryId);
    if (cid) subjectCountByCategory[cid] = (subjectCountByCategory[cid] || 0) + 1;
  }

  // ---- 1. Sync subject.testCount ----
  console.log('\n[sync] subject.testCount');
  let subjFixed = 0, subjOk = 0, subjFailed = 0;
  for (const s of subjects) {
    const correct = testCountBySubject[s.id] || 0;
    const current = unwrap(s.fields.testCount);
    if (current === correct) { subjOk++; continue; }
    try {
      await patchDoc(idToken, 'subjects', s.id, {
        testCount: wrapNumber(correct),
        // Use server timestamp via fieldTransform — but REST patch with updateMask
        // would need fieldTransform. Skip updatedAt to keep it simple; the count
        // itself is what the Flutter app reads.
      });
      subjFixed++;
      console.log(`  ✓ subject ${s.id}: ${current ?? '∅'} → ${correct}`);
    } catch (e) {
      subjFailed++;
      console.error(`  ✗ subject ${s.id}: ${(e as Error).message}`);
    }
  }
  console.log(`[sync] subjects: ${subjFixed} fixed, ${subjOk} ok, ${subjFailed} failed`);

  // ---- 2. Sync category.subjectCount ----
  console.log('\n[sync] category.subjectCount');
  let catFixed = 0, catOk = 0, catFailed = 0;
  for (const c of categories) {
    const correct = subjectCountByCategory[c.id] || 0;
    const current = unwrap(c.fields.subjectCount);
    if (current === correct) { catOk++; continue; }
    try {
      await patchDoc(idToken, 'categories', c.id, {
        subjectCount: wrapNumber(correct),
      });
      catFixed++;
      console.log(`  ✓ category ${c.id}: ${current ?? '∅'} → ${correct}`);
    } catch (e) {
      catFailed++;
      console.error(`  ✗ category ${c.id}: ${(e as Error).message}`);
    }
  }
  console.log(`[sync] categories: ${catFixed} fixed, ${catOk} ok, ${catFailed} failed`);

  // ---- 3. Sync test.questionCount ----
  console.log('\n[sync] test.questionCount');
  let testFixed = 0, testOk = 0, testFailed = 0;
  for (const t of tests) {
    const correct = questionCountByTest[t.id] || 0;
    const current = unwrap(t.fields.questionCount);
    if (current === correct) { testOk++; continue; }
    try {
      await patchDoc(idToken, 'tests', t.id, {
        questionCount: wrapNumber(correct),
      });
      testFixed++;
      console.log(`  ✓ test ${t.id}: ${current ?? '∅'} → ${correct}`);
    } catch (e) {
      testFailed++;
      console.error(`  ✗ test ${t.id}: ${(e as Error).message}`);
    }
  }
  console.log(`[sync] tests: ${testFixed} fixed, ${testOk} ok, ${testFailed} failed`);

  const totalFixed = subjFixed + catFixed + testFixed;
  const totalFailed = subjFailed + catFailed + testFailed;
  console.log(`\n========================================`);
  console.log(`DONE — ${totalFixed} docs repaired, ${totalFailed} failed`);
  console.log(`  subjects:  ${subjFixed} fixed / ${subjOk} ok / ${subjFailed} failed`);
  console.log(`  categories:${catFixed} fixed / ${catOk} ok / ${catFailed} failed`);
  console.log(`  tests:     ${testFixed} fixed / ${testOk} ok / ${testFailed} failed`);
  console.log(`========================================`);
  if (totalFailed > 0) process.exit(1);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
