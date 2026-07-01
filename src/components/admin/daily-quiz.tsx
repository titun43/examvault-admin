'use client';

import Tests from './tests';

/**
 * Dedicated Daily Quiz management view.
 *
 * This is a thin wrapper around the Tests component with `fixedType="dailyQuiz"`,
 * so admins can manage daily quizzes without seeing other test types. The Tests
 * component handles all the CRUD (add/edit/delete, questions) — we just lock
 * the type to "dailyQuiz" so every test created here lands in the user app's
 * Daily Quiz screen.
 *
 * Wired up via:
 *  - src/lib/store.ts → 'daily-quiz' AdminSection
 *  - src/components/admin/admin-shell.tsx → nav item under "Content"
 *  - src/app/page.tsx → case 'daily-quiz'
 */
export default function DailyQuiz() {
  return <Tests fixedType="dailyQuiz" />;
}
