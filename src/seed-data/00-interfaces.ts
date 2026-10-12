// =============================================================================
// ExamVault — Real Indian Exam Seed Data (v2)
// =============================================================================
// 100% real Indian exam-prep data for Firestore seeding.
// Special focus: ASSAM (all major exams) + all major Indian state PSCs.
//
// Contents:
//   - 23 categories (Assam-heavy + all major states + national)
//   - 46 subjects (2 per category)
//   - 46 tests (1 per subject)
//   - 230 questions (5 per test) — all real exam-style
//   - 8 banners (homepage promotional)
//   - 12 announcements (exam notifications)
//   - 20 upcoming exams (real 2025-2026 schedules, official URLs)
//   - 25 current affairs (real 2025 Indian + Assam-specific)
//
// Categories covered:
//   ASSAM (7):  APSC CCE, ADRE Grade III, ADRE Grade IV, Assam Police, Assam TET,
//               SEBA HSLC, DME/PNRD Assam
//   STATES (9): WBCS, UPPSC, RPSC, MPSC, BPSC, JPSC, OPSC, Kerala PSC, TNPSC
//   NATIONAL (7): UPSC, SSC, Banking, Railway, Defence, Teaching, LIC
// =============================================================================

export interface SeedCategory {
  name: string;
  slug: string;
  icon: string;
  description: string;
  image: string;
  color: string;
  order: number;
  isPremium: boolean;
  premiumPrice: number;
  premiumDurationMonths: number;
  subjects: SeedSubject[];
}

export interface SeedSubject {
  name: string;
  slug: string;
  icon: string;
  description: string;
  order: number;
  tests: SeedTest[];
}

export interface SeedTest {
  title: string;
  slug: string;
  type: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  isPublished: boolean;
  difficulty: string;
  negativeMarking: boolean;
  negativeMarks: number;
  instructions: string;
  year: number;
  examSession: string;
  isPremium: boolean;
  price: number;
  questions: SeedQuestion[];
}

export interface SeedQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subjectTopic: string;
  marks: number;
  isPremium: boolean;
}

export interface SeedBanner {
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  linkLabel: string;
  order: number;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
}

export interface SeedAnnouncement {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promo';
  imageUrl: string;
  link: string;
  linkLabel: string;
  isPinned: boolean;
  isPublished: boolean;
  order: number;
  expiresAt: string;
}

export interface SeedUpcomingExam {
  name: string;
  organization: string;
  categoryIdSlug: string;
  examDate: string;
  applicationStartDate: string;
  applicationEndDate: string;
  notificationUrl: string;
  syllabusUrl: string;
  officialUrl?: string;
  applyUrl?: string;
  imageUrl: string;
  description: string;
  tags: string[];
  isPublished: boolean;
  order: number;
}

export interface SeedCurrentAffair {
  date: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  category: string;
  categoryId?: string;
  isImportant: boolean;
  tags: string[];
  pdfUrl?: string;
  imageUrl?: string;
}

// Date helpers — bannerStart MUST be in the past so the Flutter app's
// `isVisible` check (now.isBefore(startsAt) → hidden) passes immediately.
const nextYear = new Date().getFullYear() + 1;
const bannerStart = '2024-01-01T00:00:00.000Z';

