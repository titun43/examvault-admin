import { create } from 'zustand';

export type AdminSection =
  | 'dashboard'
  | 'categories'
  | 'subjects'
  | 'tests'
  | 'daily-quiz'
  | 'previous-papers'
  | 'study-materials'
  | 'questions'
  | 'announcements'
  | 'upcoming-exams'
  | 'banners'
  | 'app-open-banners'
  | 'current-affairs'
  | 'users'
  | 'payments'
  | 'products'
  | 'payment-settings'
  | 'notifications'
  | 'premium-plans'
  | 'support'
  | 'question-reports'
  | 'data-management';

interface AppState {
  currentSection: AdminSection;
  setCurrentSection: (section: AdminSection) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  // Context for questions: which test are we managing questions for?
  selectedTestId: string | null;
  selectedTestTitle: string | null;
  setSelectedTest: (id: string | null, title: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentSection: 'dashboard',
  setCurrentSection: (section) => set({ currentSection: section }),
  sidebarOpen: false,
  setSidebarOpen: (val) => set({ sidebarOpen: val }),
  selectedTestId: null,
  selectedTestTitle: null,
  setSelectedTest: (id, title) => set({ selectedTestId: id, selectedTestTitle: title }),
}));
