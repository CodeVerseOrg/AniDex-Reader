'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  signIn,
  signUp,
  signOut,
  getReadingHistory,
  syncReadingHistory,
  deleteFromHistory,
  clearReadingHistory,
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getUserPreferences,
  saveUserPreferences,
  DbReadingHistory,
  DbFavorite,
  DbUserPreferences,
} from '@/lib/supabase';

// Auth Hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await signIn(email, password);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username?: string) => {
    setLoading(true);
    try {
      const data = await signUp(email, password, username);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}

// Reading History Hook with Supabase sync
export function useSyncedHistory() {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState<DbReadingHistory[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch history from Supabase
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getReadingHistory(user.id);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [isAuthenticated, fetchHistory]);

  // Add/Update history entry
  const addToHistory = useCallback(
    async (entry: {
      mangaId: string;
      anilistId?: number;
      title: string;
      coverUrl: string;
      lastChapterId: string;
      lastChapterNumber: string;
      lastPage: number;
    }) => {
      if (!user) return;
      try {
        await syncReadingHistory(user.id, entry);
        await fetchHistory();
      } catch (error) {
        console.error('Failed to sync history:', error);
      }
    },
    [user, fetchHistory]
  );

  // Remove from history
  const removeFromHistory = useCallback(
    async (mangaId: string) => {
      if (!user) return;
      try {
        await deleteFromHistory(user.id, mangaId);
        setHistory((prev) => prev.filter((h) => h.manga_id !== mangaId));
      } catch (error) {
        console.error('Failed to remove from history:', error);
      }
    },
    [user]
  );

  // Clear all history
  const clearHistory = useCallback(async () => {
    if (!user) return;
    try {
      await clearReadingHistory(user.id);
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, [user]);

  return {
    history,
    loading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    refresh: fetchHistory,
  };
}

// Favorites Hook with Supabase sync
export function useSyncedFavorites() {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<DbFavorite[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch favorites from Supabase
  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getFavorites(user.id);
      setFavorites(data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, fetchFavorites]);

  // Add to favorites
  const add = useCallback(
    async (manga: {
      mangaId: string;
      anilistId?: number;
      title: string;
      coverUrl: string;
    }) => {
      if (!user) return;
      try {
        await addFavorite(user.id, manga);
        await fetchFavorites();
      } catch (error) {
        console.error('Failed to add favorite:', error);
      }
    },
    [user, fetchFavorites]
  );

  // Remove from favorites
  const remove = useCallback(
    async (mangaId: string) => {
      if (!user) return;
      try {
        await removeFavorite(user.id, mangaId);
        setFavorites((prev) => prev.filter((f) => f.manga_id !== mangaId));
      } catch (error) {
        console.error('Failed to remove favorite:', error);
      }
    },
    [user]
  );

  // Check if manga is favorited
  const checkIsFavorite = useCallback(
    async (mangaId: string) => {
      if (!user) return false;
      try {
        return await isFavorite(user.id, mangaId);
      } catch (error) {
        console.error('Failed to check favorite:', error);
        return false;
      }
    },
    [user]
  );

  // Toggle favorite
  const toggle = useCallback(
    async (manga: {
      mangaId: string;
      anilistId?: number;
      title: string;
      coverUrl: string;
    }) => {
      if (!user) return;
      const isFav = favorites.some((f) => f.manga_id === manga.mangaId);
      if (isFav) {
        await remove(manga.mangaId);
      } else {
        await add(manga);
      }
    },
    [user, favorites, add, remove]
  );

  return {
    favorites,
    loading,
    add,
    remove,
    toggle,
    isFavorite: (mangaId: string) => favorites.some((f) => f.manga_id === mangaId),
    checkIsFavorite,
    refresh: fetchFavorites,
  };
}

// User Preferences Hook with Supabase sync
export function useSyncedPreferences() {
  const { user, isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<DbUserPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch preferences from Supabase
  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserPreferences(user.id);
      setPreferences(data);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPreferences();
    } else {
      setPreferences(null);
    }
  }, [isAuthenticated, fetchPreferences]);

  // Save preferences
  const save = useCallback(
    async (prefs: Partial<{
      readerMode: 'vertical' | 'horizontal' | 'webtoon';
      readerTheme: 'light' | 'dark' | 'sepia';
      zoom: number;
      fitWidth: boolean;
      preloadPages: number;
      showProgress: boolean;
      siteDarkMode: boolean;
    }>) => {
      if (!user) return;
      try {
        await saveUserPreferences(user.id, prefs);
        await fetchPreferences();
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    },
    [user, fetchPreferences]
  );

  return {
    preferences,
    loading,
    save,
    refresh: fetchPreferences,
  };
}
