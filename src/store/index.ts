import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReaderSettings, ReaderMode, ReaderTheme } from '@/types';

interface ReaderStore {
  // Settings
  settings: ReaderSettings;
  setMode: (mode: ReaderMode) => void;
  setTheme: (theme: ReaderTheme) => void;
  setZoom: (zoom: number) => void;
  setFitWidth: (fitWidth: boolean) => void;
  setPreloadPages: (count: number) => void;
  setShowProgress: (show: boolean) => void;
  
  // Reader state
  currentPage: number;
  totalPages: number;
  isFullscreen: boolean;
  isSettingsOpen: boolean;
  
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

export const useReaderStore = create<ReaderStore>()(
  persist(
    (set, get) => ({
      settings: {
        mode: 'vertical',
        theme: 'dark',
        zoom: 100,
        fitWidth: true,
        preloadPages: 3,
        showProgress: true,
      },
      
      currentPage: 0,
      totalPages: 0,
      isFullscreen: false,
      isSettingsOpen: false,
      
      setMode: (mode) =>
        set((state) => ({
          settings: { ...state.settings, mode },
        })),
      
      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),
      
      setZoom: (zoom) =>
        set((state) => ({
          settings: { ...state.settings, zoom: Math.max(50, Math.min(200, zoom)) },
        })),
      
      setFitWidth: (fitWidth) =>
        set((state) => ({
          settings: { ...state.settings, fitWidth },
        })),
      
      setPreloadPages: (preloadPages) =>
        set((state) => ({
          settings: { ...state.settings, preloadPages },
        })),
      
      setShowProgress: (showProgress) =>
        set((state) => ({
          settings: { ...state.settings, showProgress },
        })),
      
      setCurrentPage: (currentPage) => set({ currentPage }),
      setTotalPages: (totalPages) => set({ totalPages }),
      setFullscreen: (isFullscreen) => set({ isFullscreen }),
      setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
      
      nextPage: () => {
        const { currentPage, totalPages } = get();
        if (currentPage < totalPages - 1) {
          set({ currentPage: currentPage + 1 });
        }
      },
      
      prevPage: () => {
        const { currentPage } = get();
        if (currentPage > 0) {
          set({ currentPage: currentPage - 1 });
        }
      },
      
      goToPage: (page) => {
        const { totalPages } = get();
        set({ currentPage: Math.max(0, Math.min(page, totalPages - 1)) });
      },
    }),
    {
      name: 'reader-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

// Reading history store
interface HistoryEntry {
  mangaId: string;
  anilistId?: number;
  title: string;
  coverUrl: string;
  lastChapterId: string;
  lastChapterNumber: string;
  lastPage: number;
  timestamp: number;
}

interface HistoryStore {
  history: HistoryEntry[];
  addToHistory: (entry: Omit<HistoryEntry, 'timestamp'>) => void;
  removeFromHistory: (mangaId: string) => void;
  clearHistory: () => void;
  getLastRead: (mangaId: string) => HistoryEntry | undefined;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      
      addToHistory: (entry) => {
        const { history } = get();
        const filtered = history.filter((h) => h.mangaId !== entry.mangaId);
        const newEntry = { ...entry, timestamp: Date.now() };
        set({ history: [newEntry, ...filtered].slice(0, 100) }); // Keep last 100
      },
      
      removeFromHistory: (mangaId) => {
        set((state) => ({
          history: state.history.filter((h) => h.mangaId !== mangaId),
        }));
      },
      
      clearHistory: () => set({ history: [] }),
      
      getLastRead: (mangaId) => {
        return get().history.find((h) => h.mangaId === mangaId);
      },
    }),
    {
      name: 'reading-history',
    }
  )
);

// Theme store for site-wide theming
interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: true,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
      setDark: (isDark) => set({ isDark }),
    }),
    {
      name: 'site-theme',
    }
  )
);

// Search store for persisting search state
interface SearchStore {
  query: string;
  filters: {
    genres: string[];
    status: string | null;
    year: number | null;
    sort: string;
  };
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchStore['filters']>) => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  filters: {
    genres: [],
    status: null,
    year: null,
    sort: 'POPULARITY_DESC',
  },
  setQuery: (query) => set({ query }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () =>
    set({
      query: '',
      filters: {
        genres: [],
        status: null,
        year: null,
        sort: 'POPULARITY_DESC',
      },
    }),
}));
