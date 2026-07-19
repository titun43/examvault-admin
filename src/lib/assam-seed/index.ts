// =============================================================================
// ExamVault — Assam Seed Data (assembler)
// Merges all category question pools into one QuestionPoolMap and exposes
// the fully-resolved seed dataset (questions assigned to tests via slicing).
// =============================================================================

import {
  SEED_CATEGORIES,
  SEED_SUBJECTS,
  SEED_TESTS,
  SEED_BANNERS,
  SEED_STUDY_MATERIALS,
  resolveQuestions,
  type QuestionPoolMap,
  type SeedCategory,
  type SeedSubject,
  type SeedTest,
  type SeedBanner,
  type SeedStudyMaterial,
  type SeedQuestionPoolItem,
} from './structure';

import { APSC_POOLS_A } from './questions-apsc-a';
import { APSC_POOLS_C } from './questions-apsc-c';
import { APSC_POOLS_GEO } from './questions-apsc-geo';
import { APSC_POOLS_POLITY } from './questions-apsc-polity';
import { POLICE_POOLS_A } from './questions-police-a';
import { POLICE_POOLS_B } from './questions-police-b';
import { POLICE_POOLS_C } from './questions-police-c';
import { TET_POOLS_A } from './questions-tet-a';
import { TET_POOLS_B } from './questions-tet-b';
import { ADRE_POOLS_GK } from './questions-adre-gk';
import { ADRE_POOLS_REASONING } from './questions-adre-reasoning';
import { ADRE_POOLS_B } from './questions-adre-b';
import { ADRE_POOLS_C } from './questions-adre-c';
import { SECRETARIAT_POOLS } from './questions-secretariat';
import { SSC_POOLS } from './questions-ssc';

// ---------------------------------------------------------------------------
// Merge all category pools into one map keyed by subjectKey.
// ---------------------------------------------------------------------------
const ALL_POOLS: QuestionPoolMap = {
  ...APSC_POOLS_A,
  ...APSC_POOLS_C,
  ...APSC_POOLS_GEO,
  ...APSC_POOLS_POLITY,
  ...POLICE_POOLS_A,
  ...POLICE_POOLS_B,
  ...POLICE_POOLS_C,
  ...TET_POOLS_A,
  ...TET_POOLS_B,
  ...ADRE_POOLS_GK,
  ...ADRE_POOLS_REASONING,
  ...ADRE_POOLS_B,
  ...ADRE_POOLS_C,
  ...SECRETARIAT_POOLS,
  ...SSC_POOLS,
};

export interface ResolvedQuestion {
  testKey: string;
  subjectKey: string;
  item: SeedQuestionPoolItem;
}

export interface AssamSeedData {
  categories: SeedCategory[];
  subjects: SeedSubject[];
  tests: SeedTest[];
  banners: SeedBanner[];
  studyMaterials: SeedStudyMaterial[];
  questions: ResolvedQuestion[];
  /** Pool size per subject (for verification / display). */
  poolSizes: Record<string, number>;
}

/** Build the full resolved seed dataset (pure data, no Firebase calls). */
export function buildAssamSeed(): AssamSeedData {
  const questions = resolveQuestions(ALL_POOLS, SEED_TESTS);
  const poolSizes: Record<string, number> = {};
  for (const [k, v] of Object.entries(ALL_POOLS)) {
    poolSizes[k] = v.length;
  }
  return {
    categories: SEED_CATEGORIES,
    subjects: SEED_SUBJECTS,
    tests: SEED_TESTS,
    banners: SEED_BANNERS,
    studyMaterials: SEED_STUDY_MATERIALS,
    questions,
    poolSizes,
  };
}

// Per-entity counts for UI display (computed once at module load).
const _seed = buildAssamSeed();
export const ASSAM_SEED_SUMMARY = {
  categories: _seed.categories.length,
  subjects: _seed.subjects.length,
  tests: _seed.tests.length,
  banners: _seed.banners.length,
  studyMaterials: _seed.studyMaterials.length,
  questions: _seed.questions.length,
  totalPoolItems: Object.values(_seed.poolSizes).reduce((a, b) => a + b, 0),
};
