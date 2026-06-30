import { create } from 'zustand';

export type AdminSection =
  | 'dashboard'
  | 'categories'
  | 'subjects'
  | 'tests'
  | 'previous-papers'
  | 'questions'
  | 'announcements'
  | 'upcoming-exams'
  | 'banners'
  | 'current-affairs'
  | 'users'
  | 'payments';

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
