// =============================================================================
// ExamVault — Assam Seed Data (structure)
// Target: Assam students. Real, Assam-focused competitive-exam content.
//
// Hierarchy: Categories → Subjects → Tests → Questions (bilingual EN + অসমীয়া)
//
// This file defines the STRUCTURE (categories, subjects, tests, banners,
// study materials) plus the question-pool → test-slicing logic. The actual
// bilingual question pools live in questions-<category>.ts files (written by
// parallel agents) and are assembled in index.ts.
// =============================================================================

export type TestType = 'mock' | 'previousYear' | 'practice' | 'subjectwise' | 'dailyQuiz';

// ---------------------------------------------------------------------------
// Reference-keyed definitions (IDs are assigned at seed time by Firestore
// addDoc, so we link entities by stable string keys instead of IDs).
// ---------------------------------------------------------------------------

export interface SeedCategory {
  key: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  order: number;
  isPremium: boolean;
  premiumPrice: number;
  premiumDurationMonths: number;
}

export interface SeedSubject {
  key: string;
  categoryKey: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  order: number;
  premiumPrice: number;
}

export interface SeedTest {
  key: string;
  subjectKey: string;
  categoryKey: string;
  title: string;
  slug: string;
  type: TestType;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  negativeMarking: boolean;
  negativeMarks: number;
  instructions: string;
  year: number;
  examSession: string;
  isPremium: boolean;
  price: number;
  questionCount: number;
}

export interface SeedQuestionPoolItem {
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  explanation: string;
  subjectTopic: string;
  marks: number;
}

export interface SeedBanner {
  title: string;
  subtitle: string;
  imageFile: string;
  order: number;
  isActive: boolean;
  primaryButtonLabel: string;
  primaryButtonSection: string;
}

// ===========================================================================
// CATEGORIES (6) — real Assam competitive exams
// ===========================================================================
export const SEED_CATEGORIES: SeedCategory[] = [
  {
    key: 'apsc',
    name: 'APSC',
    slug: 'apsc',
    icon: '🏛️',
    description: 'Assam Public Service Commission — Combined Competitive Examination (Prelims & Mains). The flagship state-civil-services exam.',
    color: '#10b981',
    order: 1,
    isPremium: false,
    premiumPrice: 199,
    premiumDurationMonths: 3,
  },
  {
    key: 'assam-police',
    name: 'Assam Police',
    slug: 'assam-police',
    icon: '🛡️',
    description: 'SLPRB Assam — Constable (UB/AB) & Sub-Inspector recruitment. Mass-recruitment exam for the Assam Police Department.',
    color: '#3b82f6',
    order: 2,
    isPremium: false,
    premiumPrice: 149,
    premiumDurationMonths: 2,
  },
  {
    key: 'assam-tet',
    name: 'Assam TET',
    slug: 'assam-tet',
    icon: '👩‍🏫',
    description: 'Assam Teachers Eligibility Test — Elementary (LP & UP) and Secondary. Mandatory qualification for government teacher posts in Assam.',
    color: '#f59e0b',
    order: 3,
    isPremium: false,
    premiumPrice: 129,
    premiumDurationMonths: 2,
  },
  {
    key: 'adre',
    name: 'Assam Direct Recruitment',
    slug: 'assam-direct-recruitment',
    icon: '📝',
    description: 'ADRE — Grade III & Grade IV recruitment conducted by SEBA/SLPRB for 32,000+ government posts across Assam.',
    color: '#ef4444',
    order: 4,
    isPremium: false,
    premiumPrice: 149,
    premiumDurationMonths: 2,
  },
  {
    key: 'assam-secretariat',
    name: 'Assam Secretariat',
    slug: 'assam-secretariat',
    icon: '📂',
    description: 'Assam Secretariat — Junior Assistant & Computer Operator recruitment. Clerical-grade government jobs in the state secretariat.',
    color: '#8b5cf6',
    order: 5,
    isPremium: false,
    premiumPrice: 99,
    premiumDurationMonths: 1,
  },
  {
    key: 'ssc-railway',
    name: 'SSC & Railway',
    slug: 'ssc-railway',
    icon: '🚆',
    description: 'SSC (CGL/CHSL/MTS) & Railway (RRB NTPC/Group-D) exams with regional relevance for Assam aspirants.',
    color: '#06b6d4',
    order: 6,
    isPremium: false,
    premiumPrice: 129,
    premiumDurationMonths: 2,
  },
];

// ===========================================================================
// SUBJECTS (28) — mapped to each category's actual syllabus
// ===========================================================================
export const SEED_SUBJECTS: SeedSubject[] = [
  // --- APSC (5) ---
  { key: 'apsc-gs', categoryKey: 'apsc', name: 'General Studies', slug: 'apsc-general-studies', icon: '📚', description: 'APSC GS Paper — History, Geography, Polity, Economy, Science & Current Affairs.', order: 1, premiumPrice: 0 },
  { key: 'apsc-history', categoryKey: 'apsc', name: 'History of Assam & India', slug: 'apsc-history', icon: '🕰️', description: 'Ancient, Medieval & Modern history with special focus on Assam history.', order: 2, premiumPrice: 0 },
  { key: 'apsc-geography', categoryKey: 'apsc', name: 'Geography', slug: 'apsc-geography', icon: '🌍', description: 'Physical, economic & regional geography of Assam and India.', order: 3, premiumPrice: 0 },
  { key: 'apsc-polity', categoryKey: 'apsc', name: 'Indian Polity', slug: 'apsc-indian-polity', icon: '⚖️', description: 'Constitution, governance, Panchayati Raj & Assam state administration.', order: 4, premiumPrice: 0 },
  { key: 'apsc-economy', categoryKey: 'apsc', name: 'Economy', slug: 'apsc-economy', icon: '💰', description: 'Indian economy, Assam budget, banking & economic development.', order: 5, premiumPrice: 0 },

  // --- Assam Police (5) ---
  { key: 'police-gk', categoryKey: 'assam-police', name: 'General Knowledge', slug: 'police-general-knowledge', icon: '🧠', description: 'Assam & India general knowledge for police recruitment.', order: 1, premiumPrice: 0 },
  { key: 'police-reasoning', categoryKey: 'assam-police', name: 'Reasoning', slug: 'police-reasoning', icon: '🧩', description: 'Logical & analytical reasoning for SI/Constable exam.', order: 2, premiumPrice: 0 },
  { key: 'police-quant', categoryKey: 'assam-police', name: 'Quantitative Aptitude', slug: 'police-quantitative-aptitude', icon: '🔢', description: 'Numerical ability for Assam Police recruitment.', order: 3, premiumPrice: 0 },
  { key: 'police-english', categoryKey: 'assam-police', name: 'English', slug: 'police-english', icon: '🔤', description: 'English language & grammar for police exam.', order: 4, premiumPrice: 0 },
  { key: 'police-assamese', categoryKey: 'assam-police', name: 'Assamese Language', slug: 'police-assamese-language', icon: '📖', description: 'অসমীয়া ভাষা আৰু ব্যাকৰণ — Assamese language & grammar.', order: 5, premiumPrice: 0 },

  // --- Assam TET (5) ---
  { key: 'tet-cdp', categoryKey: 'assam-tet', name: 'Child Development & Pedagogy', slug: 'tet-child-development-pedagogy', icon: '🧒', description: 'CDP — learning theories, Piaget, Vygotsky, assessment & inclusive education.', order: 1, premiumPrice: 0 },
  { key: 'tet-assamese', categoryKey: 'assam-tet', name: 'Language I — Assamese', slug: 'tet-language-assamese', icon: '📖', description: 'অসমীয়া ভাষা — ব্যাকৰণ, সাহিত্য আৰু শিক্ষাশাস্ত্ৰ।', order: 2, premiumPrice: 0 },
  { key: 'tet-english', categoryKey: 'assam-tet', name: 'Language II — English', slug: 'tet-language-english', icon: '🔤', description: 'English language comprehension & pedagogy for TET.', order: 3, premiumPrice: 0 },
  { key: 'tet-maths', categoryKey: 'assam-tet', name: 'Mathematics', slug: 'tet-mathematics', icon: '🔢', description: 'Mathematics pedagogy & content for elementary level.', order: 4, premiumPrice: 0 },
  { key: 'tet-evs', categoryKey: 'assam-tet', name: 'Environmental Studies', slug: 'tet-environmental-studies', icon: '🌳', description: 'EVS — environment, Assam ecology & pedagogy.', order: 5, premiumPrice: 0 },

  // --- ADRE (5) ---
  { key: 'adre-gk', categoryKey: 'adre', name: 'General Knowledge (Assam)', slug: 'adre-general-knowledge', icon: '🧠', description: 'Assam-focused GK for ADRE Grade III & IV.', order: 1, premiumPrice: 0 },
  { key: 'adre-reasoning', categoryKey: 'adre', name: 'Reasoning', slug: 'adre-reasoning', icon: '🧩', description: 'Logical reasoning for ADRE recruitment.', order: 2, premiumPrice: 0 },
  { key: 'adre-maths', categoryKey: 'adre', name: 'Mathematics', slug: 'adre-mathematics', icon: '🔢', description: 'Class IX–X level mathematics for ADRE.', order: 3, premiumPrice: 0 },
  { key: 'adre-english', categoryKey: 'adre', name: 'English', slug: 'adre-english', icon: '🔤', description: 'English grammar & comprehension for ADRE.', order: 4, premiumPrice: 0 },
  { key: 'adre-awareness', categoryKey: 'adre', name: 'General Awareness', slug: 'adre-general-awareness', icon: '🌐', description: 'India & world general awareness for ADRE.', order: 5, premiumPrice: 0 },

  // --- Assam Secretariat (4) ---
  { key: 'sec-english', categoryKey: 'assam-secretariat', name: 'General English', slug: 'secretariat-general-english', icon: '🔤', description: 'English grammar, vocabulary & drafting for Junior Assistant.', order: 1, premiumPrice: 0 },
  { key: 'sec-gk', categoryKey: 'assam-secretariat', name: 'General Knowledge', slug: 'secretariat-general-knowledge', icon: '🧠', description: 'Assam & India GK for Secretariat exam.', order: 2, premiumPrice: 0 },
  { key: 'sec-reasoning', categoryKey: 'assam-secretariat', name: 'Reasoning', slug: 'secretariat-reasoning', icon: '🧩', description: 'Logical & verbal reasoning for Junior Assistant.', order: 3, premiumPrice: 0 },
  { key: 'sec-computer', categoryKey: 'assam-secretariat', name: 'Computer Knowledge', slug: 'secretariat-computer-knowledge', icon: '💻', description: 'MS Office, internet & computer fundamentals.', order: 4, premiumPrice: 0 },

  // --- SSC & Railway (4) ---
  { key: 'ssc-reasoning', categoryKey: 'ssc-railway', name: 'General Intelligence & Reasoning', slug: 'ssc-general-intelligence-reasoning', icon: '🧩', description: 'Verbal & non-verbal reasoning for SSC/RRB.', order: 1, premiumPrice: 0 },
  { key: 'ssc-quant', categoryKey: 'ssc-railway', name: 'Quantitative Aptitude', slug: 'ssc-quantitative-aptitude', icon: '🔢', description: 'Maths aptitude for SSC CGL/CHSL & RRB.', order: 2, premiumPrice: 0 },
  { key: 'ssc-english', categoryKey: 'ssc-railway', name: 'English Language', slug: 'ssc-english-language', icon: '🔤', description: 'English for SSC & Railway exams.', order: 3, premiumPrice: 0 },
  { key: 'ssc-ga', categoryKey: 'ssc-railway', name: 'General Awareness', slug: 'ssc-general-awareness', icon: '🌐', description: 'Static GK & current affairs for SSC/RRB.', order: 4, premiumPrice: 0 },
];

// ===========================================================================
// TESTS (~80) — the PRIMARY FOCUS per user request ("bohut test")
// ===========================================================================

const COMMON_INSTRUCTIONS_EN =
  'Read each question carefully. Each question carries the marks shown. ' +
  'Negative marking applies as specified. Choose the BEST answer. ' +
  'Do not refresh or leave the page during the test.';
const COMMON_INSTRUCTIONS_AS =
  'প্ৰতিটো প্ৰশ্ন মনোযোগেৰে পঢ়ক। প্ৰতিটো প্ৰশ্নত দেখুওৱা নম্বৰ থাকিব। ' +
  'নিৰ্দিষ্ট কৰা অনুসাৰে ঋণাত্মক নম্বৰ প্ৰযোজ্য। শ্ৰেষ্ঠ উত্তৰটো বাছক। ' +
  'পৰীক্ষাৰ সময়ত পৃষ্ঠাটো ৰিফ্ৰেশ বা এৰি নাযাব।';

function mkTest(
  key: string,
  subjectKey: string,
  categoryKey: string,
  title: string,
  slug: string,
  type: TestType,
  duration: number,
  totalMarks: number,
  passingMarks: number,
  difficulty: 'easy' | 'medium' | 'hard',
  year: number,
  n: number,
  opts?: Partial<SeedTest>,
): SeedTest {
  return {
    key,
    subjectKey,
    categoryKey,
    title,
    slug,
    type,
    duration,
    totalMarks,
    passingMarks,
    difficulty,
    negativeMarking: true,
    negativeMarks: 0.25,
    instructions: `${COMMON_INSTRUCTIONS_EN}\n\n${COMMON_INSTRUCTIONS_AS}`,
    year,
    examSession: '',
    isPremium: opts?.isPremium ?? false,
    price: opts?.price ?? 0,
    questionCount: n,
  };
}

export const SEED_TESTS: SeedTest[] = [
  // ============ APSC — General Studies (4 tests) ============
  mkTest('apsc-gs-mock-1', 'apsc-gs', 'apsc', 'APSC GS Mock Test 1', 'apsc-gs-mock-1', 'mock', 120, 200, 100, 'medium', 2025, 10),
  mkTest('apsc-gs-mock-2', 'apsc-gs', 'apsc', 'APSC GS Mock Test 2', 'apsc-gs-mock-2', 'mock', 120, 200, 100, 'medium', 2025, 10),
  mkTest('apsc-gs-prev-2023', 'apsc-gs', 'apsc', 'APSC GS Previous Year 2023', 'apsc-gs-previous-2023', 'previousYear', 120, 200, 100, 'hard', 2023, 10),
  mkTest('apsc-gs-practice-1', 'apsc-gs', 'apsc', 'APSC GS Practice Set 1', 'apsc-gs-practice-1', 'practice', 60, 100, 40, 'easy', 2025, 10, { isPremium: true, price: 49 }),

  // ============ APSC — History (4) ============
  mkTest('apsc-history-mock-1', 'apsc-history', 'apsc', 'APSC History Mock Test 1', 'apsc-history-mock-1', 'mock', 90, 150, 75, 'medium', 2025, 10),
  mkTest('apsc-history-mock-2', 'apsc-history', 'apsc', 'APSC History Mock Test 2', 'apsc-history-mock-2', 'mock', 90, 150, 75, 'medium', 2025, 10),
  mkTest('apsc-history-prev-2022', 'apsc-history', 'apsc', 'APSC History Previous Year 2022', 'apsc-history-previous-2022', 'previousYear', 90, 150, 75, 'hard', 2022, 10),
  mkTest('apsc-history-practice-1', 'apsc-history', 'apsc', 'APSC History Practice Set 1', 'apsc-history-practice-1', 'practice', 45, 100, 40, 'easy', 2025, 10, { isPremium: true, price: 49 }),

  // ============ APSC — Geography (4) ============
  mkTest('apsc-geo-mock-1', 'apsc-geography', 'apsc', 'APSC Geography Mock Test 1', 'apsc-geography-mock-1', 'mock', 90, 150, 75, 'medium', 2025, 10),
  mkTest('apsc-geo-mock-2', 'apsc-geography', 'apsc', 'APSC Geography Mock Test 2', 'apsc-geography-mock-2', 'mock', 90, 150, 75, 'medium', 2025, 10),
  mkTest('apsc-geo-prev-2023', 'apsc-geography', 'apsc', 'APSC Geography Previous Year 2023', 'apsc-geography-previous-2023', 'previousYear', 90, 150, 75, 'hard', 2023, 10),
  mkTest('apsc-geo-practice-1', 'apsc-geography', 'apsc', 'APSC Geography Practice Set 1', 'apsc-geo-practice-1', 'practice', 45, 100, 40, 'easy', 2025, 10, { isPremium: true, price: 49 }),

  // ============ APSC — Polity (4) ============
  mkTest('apsc-polity-mock-1', 'apsc-polity', 'apsc', 'APSC Polity Mock Test 1', 'apsc-polity-mock-1', 'mock', 90, 150, 75, 'medium', 2025, 10),
  mkTest('apsc-polity-mock-2', 'apsc-polity', 'apsc', 'APSC Polity Mock Test 2', 'apsc-polity-mock-2', 'mock', 90, 150, 75, 'medium', 2025, 10),
  mkTest('apsc-polity-prev-2022', 'apsc-polity', 'apsc', 'APSC Polity Previous Year 2022', 'apsc-polity-previous-2022', 'previousYear', 90, 150, 75, 'hard', 2022, 10),
  mkTest('apsc-polity-practice-1', 'apsc-polity', 'apsc', 'APSC Polity Practice Set 1', 'apsc-polity-practice-1', 'practice', 45, 100, 40, 'easy', 2025, 10, { isPremium: true, price: 49 }),

  // ============ APSC — Economy (4) ============
  mkTest('apsc-econ-mock-1', 'apsc-economy', 'apsc', 'APSC Economy Mock Test 1', 'apsc-economy-mock-1', 'mock', 90, 150, 75, 'medium', 2025, 10),
  mkTest('apsc-econ-mock-2', 'apsc-economy', 'apsc', 'APSC Economy Mock Test 2', 'apsc-economy-mock-2', 'mock', 90, 150, 75, 'medium', 2025, 10),
  mkTest('apsc-econ-prev-2023', 'apsc-economy', 'apsc', 'APSC Economy Previous Year 2023', 'apsc-economy-previous-2023', 'previousYear', 90, 150, 75, 'hard', 2023, 10),
  mkTest('apsc-econ-practice-1', 'apsc-economy', 'apsc', 'APSC Economy Practice Set 1', 'apsc-econ-practice-1', 'practice', 45, 100, 40, 'easy', 2025, 10, { isPremium: true, price: 49 }),

  // ============ Assam Police — GK (3) ============
  mkTest('police-gk-mock-1', 'police-gk', 'assam-police', 'Assam Police GK Mock Test 1', 'police-gk-mock-1', 'mock', 60, 100, 40, 'medium', 2025, 10),
  mkTest('police-gk-mock-2', 'police-gk', 'assam-police', 'Assam Police GK Mock Test 2', 'police-gk-mock-2', 'mock', 60, 100, 40, 'medium', 2025, 10),
  mkTest('police-gk-prev-2024', 'police-gk', 'assam-police', 'Assam Police GK Previous Year 2024', 'police-gk-previous-2024', 'previousYear', 60, 100, 40, 'hard', 2024, 10),

  // ============ Assam Police — Reasoning (3) ============
  mkTest('police-reasoning-mock-1', 'police-reasoning', 'assam-police', 'Police Reasoning Mock Test 1', 'police-reasoning-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('police-reasoning-mock-2', 'police-reasoning', 'assam-police', 'Police Reasoning Mock Test 2', 'police-reasoning-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('police-reasoning-prev-2024', 'police-reasoning', 'assam-police', 'Police Reasoning Previous Year 2024', 'police-reasoning-previous-2024', 'previousYear', 45, 100, 40, 'hard', 2024, 10),

  // ============ Assam Police — Quant (3) ============
  mkTest('police-quant-mock-1', 'police-quant', 'assam-police', 'Police Quant Mock Test 1', 'police-quant-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('police-quant-mock-2', 'police-quant', 'assam-police', 'Police Quant Mock Test 2', 'police-quant-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('police-quant-prev-2024', 'police-quant', 'assam-police', 'Police Quant Previous Year 2024', 'police-quant-previous-2024', 'previousYear', 45, 100, 40, 'hard', 2024, 10),

  // ============ Assam Police — English (3) ============
  mkTest('police-english-mock-1', 'police-english', 'assam-police', 'Police English Mock Test 1', 'police-english-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('police-english-mock-2', 'police-english', 'assam-police', 'Police English Mock Test 2', 'police-english-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('police-english-prev-2024', 'police-english', 'assam-police', 'Police English Previous Year 2024', 'police-english-previous-2024', 'previousYear', 45, 100, 40, 'hard', 2024, 10),

  // ============ Assam Police — Assamese (3) ============
  mkTest('police-assamese-mock-1', 'police-assamese', 'assam-police', 'Police Assamese Mock Test 1', 'police-assamese-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('police-assamese-mock-2', 'police-assamese', 'assam-police', 'Police Assamese Mock Test 2', 'police-assamese-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('police-assamese-prev-2024', 'police-assamese', 'assam-police', 'Police Assamese Previous Year 2024', 'police-assamese-previous-2024', 'previousYear', 45, 100, 40, 'hard', 2024, 10),

  // ============ Assam TET — CDP (2) ============
  mkTest('tet-cdp-mock-1', 'tet-cdp', 'assam-tet', 'TET CDP Mock Test 1', 'tet-cdp-mock-1', 'mock', 60, 100, 60, 'medium', 2025, 10),
  mkTest('tet-cdp-mock-2', 'tet-cdp', 'assam-tet', 'TET CDP Mock Test 2', 'tet-cdp-mock-2', 'mock', 60, 100, 60, 'medium', 2025, 10),

  // ============ Assam TET — Assamese (2) ============
  mkTest('tet-assamese-mock-1', 'tet-assamese', 'assam-tet', 'TET Assamese Mock Test 1', 'tet-assamese-mock-1', 'mock', 60, 100, 60, 'medium', 2025, 10),
  mkTest('tet-assamese-mock-2', 'tet-assamese', 'assam-tet', 'TET Assamese Mock Test 2', 'tet-assamese-mock-2', 'mock', 60, 100, 60, 'medium', 2025, 10),

  // ============ Assam TET — English (2) ============
  mkTest('tet-english-mock-1', 'tet-english', 'assam-tet', 'TET English Mock Test 1', 'tet-english-mock-1', 'mock', 60, 100, 60, 'medium', 2025, 10),
  mkTest('tet-english-mock-2', 'tet-english', 'assam-tet', 'TET English Mock Test 2', 'tet-english-mock-2', 'mock', 60, 100, 60, 'medium', 2025, 10),

  // ============ Assam TET — Maths (2) ============
  mkTest('tet-maths-mock-1', 'tet-maths', 'assam-tet', 'TET Mathematics Mock Test 1', 'tet-maths-mock-1', 'mock', 60, 100, 60, 'medium', 2025, 10),
  mkTest('tet-maths-mock-2', 'tet-maths', 'assam-tet', 'TET Mathematics Mock Test 2', 'tet-maths-mock-2', 'mock', 60, 100, 60, 'medium', 2025, 10),

  // ============ Assam TET — EVS (2) ============
  mkTest('tet-evs-mock-1', 'tet-evs', 'assam-tet', 'TET EVS Mock Test 1', 'tet-evs-mock-1', 'mock', 60, 100, 60, 'medium', 2025, 10),
  mkTest('tet-evs-mock-2', 'tet-evs', 'assam-tet', 'TET EVS Mock Test 2', 'tet-evs-mock-2', 'mock', 60, 100, 60, 'medium', 2025, 10),

  // ============ ADRE — GK (3) ============
  mkTest('adre-gk-mock-1', 'adre-gk', 'adre', 'ADRE GK Mock Test 1', 'adre-gk-mock-1', 'mock', 60, 100, 40, 'medium', 2025, 10),
  mkTest('adre-gk-mock-2', 'adre-gk', 'adre', 'ADRE GK Mock Test 2', 'adre-gk-mock-2', 'mock', 60, 100, 40, 'medium', 2025, 10),
  mkTest('adre-gk-prev-2024', 'adre-gk', 'adre', 'ADRE GK Previous Year 2024', 'adre-gk-previous-2024', 'previousYear', 60, 100, 40, 'hard', 2024, 10),

  // ============ ADRE — Reasoning (3) ============
  mkTest('adre-reasoning-mock-1', 'adre-reasoning', 'adre', 'ADRE Reasoning Mock Test 1', 'adre-reasoning-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('adre-reasoning-mock-2', 'adre-reasoning', 'adre', 'ADRE Reasoning Mock Test 2', 'adre-reasoning-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('adre-reasoning-prev-2024', 'adre-reasoning', 'adre', 'ADRE Reasoning Previous Year 2024', 'adre-reasoning-previous-2024', 'previousYear', 45, 100, 40, 'hard', 2024, 10),

  // ============ ADRE — Maths (3) ============
  mkTest('adre-maths-mock-1', 'adre-maths', 'adre', 'ADRE Mathematics Mock Test 1', 'adre-maths-mock-1', 'mock', 60, 100, 40, 'medium', 2025, 10),
  mkTest('adre-maths-mock-2', 'adre-maths', 'adre', 'ADRE Mathematics Mock Test 2', 'adre-maths-mock-2', 'mock', 60, 100, 40, 'medium', 2025, 10),
  mkTest('adre-maths-prev-2024', 'adre-maths', 'adre', 'ADRE Mathematics Previous Year 2024', 'adre-maths-previous-2024', 'previousYear', 60, 100, 40, 'hard', 2024, 10),

  // ============ ADRE — English (3) ============
  mkTest('adre-english-mock-1', 'adre-english', 'adre', 'ADRE English Mock Test 1', 'adre-english-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('adre-english-mock-2', 'adre-english', 'adre', 'ADRE English Mock Test 2', 'adre-english-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('adre-english-prev-2024', 'adre-english', 'adre', 'ADRE English Previous Year 2024', 'adre-english-previous-2024', 'previousYear', 45, 100, 40, 'hard', 2024, 10),

  // ============ ADRE — General Awareness (3) ============
  mkTest('adre-awareness-mock-1', 'adre-awareness', 'adre', 'ADRE General Awareness Mock 1', 'adre-awareness-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('adre-awareness-mock-2', 'adre-awareness', 'adre', 'ADRE General Awareness Mock 2', 'adre-awareness-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('adre-awareness-prev-2024', 'adre-awareness', 'adre', 'ADRE Awareness Previous Year 2024', 'adre-awareness-previous-2024', 'previousYear', 45, 100, 40, 'hard', 2024, 10),

  // ============ Assam Secretariat — English (2) ============
  mkTest('sec-english-mock-1', 'sec-english', 'assam-secretariat', 'Secretariat English Mock 1', 'secretariat-english-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('sec-english-mock-2', 'sec-english', 'assam-secretariat', 'Secretariat English Mock 2', 'secretariat-english-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),

  // ============ Assam Secretariat — GK (2) ============
  mkTest('sec-gk-mock-1', 'sec-gk', 'assam-secretariat', 'Secretariat GK Mock 1', 'secretariat-gk-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('sec-gk-mock-2', 'sec-gk', 'assam-secretariat', 'Secretariat GK Mock 2', 'secretariat-gk-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),

  // ============ Assam Secretariat — Reasoning (2) ============
  mkTest('sec-reasoning-mock-1', 'sec-reasoning', 'assam-secretariat', 'Secretariat Reasoning Mock 1', 'secretariat-reasoning-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('sec-reasoning-mock-2', 'sec-reasoning', 'assam-secretariat', 'Secretariat Reasoning Mock 2', 'secretariat-reasoning-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),

  // ============ Assam Secretariat — Computer (2) ============
  mkTest('sec-computer-mock-1', 'sec-computer', 'assam-secretariat', 'Secretariat Computer Mock 1', 'secretariat-computer-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('sec-computer-mock-2', 'sec-computer', 'assam-secretariat', 'Secretariat Computer Mock 2', 'secretariat-computer-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),

  // ============ SSC & Railway — Reasoning (2) ============
  mkTest('ssc-reasoning-mock-1', 'ssc-reasoning', 'ssc-railway', 'SSC Reasoning Mock Test 1', 'ssc-reasoning-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('ssc-reasoning-mock-2', 'ssc-reasoning', 'ssc-railway', 'SSC Reasoning Mock Test 2', 'ssc-reasoning-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),

  // ============ SSC & Railway — Quant (2) ============
  mkTest('ssc-quant-mock-1', 'ssc-quant', 'ssc-railway', 'SSC Quant Mock Test 1', 'ssc-quant-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('ssc-quant-mock-2', 'ssc-quant', 'ssc-railway', 'SSC Quant Mock Test 2', 'ssc-quant-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),

  // ============ SSC & Railway — English (2) ============
  mkTest('ssc-english-mock-1', 'ssc-english', 'ssc-railway', 'SSC English Mock Test 1', 'ssc-english-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('ssc-english-mock-2', 'ssc-english', 'ssc-railway', 'SSC English Mock Test 2', 'ssc-english-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),

  // ============ SSC & Railway — General Awareness (2) ============
  mkTest('ssc-ga-mock-1', 'ssc-ga', 'ssc-railway', 'SSC General Awareness Mock 1', 'ssc-ga-mock-1', 'mock', 45, 100, 40, 'medium', 2025, 10),
  mkTest('ssc-ga-mock-2', 'ssc-ga', 'ssc-railway', 'SSC General Awareness Mock 2', 'ssc-ga-mock-2', 'mock', 45, 100, 40, 'medium', 2025, 10),
];

// ===========================================================================
// BANNERS (3) — images already generated in /public/banners/
// ===========================================================================
export const SEED_BANNERS: SeedBanner[] = [
  {
    title: 'APSC CCE 2025',
    subtitle: 'Complete Mock Test Series — Prelims & Mains',
    imageFile: 'apsc-2025.png',
    order: 1,
    isActive: true,
    primaryButtonLabel: 'Start Practicing',
    primaryButtonSection: 'tests',
  },
  {
    title: 'Assam Police 2025',
    subtitle: 'Constable & Sub-Inspector — Full Test Series',
    imageFile: 'assam-police.png',
    order: 2,
    isActive: true,
    primaryButtonLabel: 'Attempt Now',
    primaryButtonSection: 'tests',
  },
  {
    title: 'ADRE 2025',
    subtitle: 'Grade III & IV — 32,000+ Posts Recruitment',
    imageFile: 'adre-2025.png',
    order: 3,
    isActive: true,
    primaryButtonLabel: 'Start Tests',
    primaryButtonSection: 'tests',
  },
];

// ===========================================================================
// POOL-SLICING: assign questions from a subject's pool to that subject's tests.
// ===========================================================================

export type QuestionPoolMap = Record<string, SeedQuestionPoolItem[]>;

export function resolveQuestions(
  pools: QuestionPoolMap,
  tests: SeedTest[],
): Array<{ testKey: string; subjectKey: string; item: SeedQuestionPoolItem }> {
  const out: Array<{ testKey: string; subjectKey: string; item: SeedQuestionPoolItem }> = [];
  const bySubject: Record<string, SeedTest[]> = {};
  for (const t of tests) {
    (bySubject[t.subjectKey] ??= []).push(t);
  }
  for (const [subjectKey, subjectTests] of Object.entries(bySubject)) {
    const pool = pools[subjectKey] ?? [];
    let cursor = 0;
    for (const t of subjectTests) {
      for (let i = 0; i < t.questionCount; i++) {
        const item = pool.length > 0 ? pool[cursor % pool.length] : FALLBACK_ITEM;
        out.push({ testKey: t.key, subjectKey, item: { ...item } });
        cursor++;
      }
    }
  }
  return out;
}

const FALLBACK_ITEM: SeedQuestionPoolItem = {
  question: 'Sample question — to be updated.\nনমুনা প্ৰশ্ন — আপডেট কৰিব লাগিব।',
  options: ['Option A / বিকল্প ক', 'Option B / বিকল্প খ', 'Option C / বিকল্প গ', 'Option D / বিকল্প ঘ'],
  correctAnswerIndex: 0,
  explanation: 'Explanation placeholder.\nব্যাখ্যাৰ স্থান।',
  subjectTopic: 'General',
  marks: 1,
};

export const SEED_STATS = {
  categories: SEED_CATEGORIES.length,
  subjects: SEED_SUBJECTS.length,
  tests: SEED_TESTS.length,
  banners: SEED_BANNERS.length,
};
