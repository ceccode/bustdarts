import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ActiveMatch, MatchConfig, AppSettings } from '../lib/types';
import { newMatch } from '../lib/game-engine';

interface AppStore {
  theme: 'dark' | 'light';
  lang: 'it' | 'en';
  settings: AppSettings;
  activeMatch: ActiveMatch | null;
  setTheme: (t: 'dark' | 'light') => void;
  setLang: (l: 'it' | 'en') => void;
  setSettings: (s: AppSettings) => void;
  startMatch: (config: MatchConfig) => void;
  setActiveMatch: (m: ActiveMatch | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      lang: 'it',
      settings: {
        language: 'it',
        theme: 'dark',
        inputMode: 'total',
        soundEnabled: false,
        hapticEnabled: true,
        showCheckoutHints: true,
      },
      activeMatch: null,
      setTheme: (theme) => set({ theme }),
      setLang: (lang) => set({ lang }),
      setSettings: (settings) => set({ settings, theme: settings.theme, lang: settings.language }),
      startMatch: (config) => set({ activeMatch: newMatch(config) }),
      setActiveMatch: (activeMatch) => set({ activeMatch }),
    }),
    {
      name: 'bust-active-match',
      storage: createJSONStorage(() => localStorage),
      // Only persist the in-progress match so it survives reloads and back
      // navigation. Settings live in IndexedDB and are loaded separately.
      partialize: (state) => ({ activeMatch: state.activeMatch }),
    }
  )
);
