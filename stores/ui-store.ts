'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  lang: 'ar' | 'en';
  sidebarCollapsed: boolean;
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;
  toggleLang: () => void;
  setLang: (l: 'ar' | 'en') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      lang: 'ar',
      sidebarCollapsed: false,
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      toggleLang: () => set((s) => ({ lang: s.lang === 'ar' ? 'en' : 'ar' })),
      setLang: (lang) => set({ lang }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'mhmd-ui' }
  )
);
