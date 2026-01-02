// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

// Database connection configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uyxldwssamouhvicswos.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database Types
export interface DbUser {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbReadingHistory {
  id: string;
  user_id: string;
  manga_id: string;
  anilist_id: number | null;
  title: string;
  cover_url: string;
  last_chapter_id: string;
  last_chapter_number: string;
  last_page: number;
  created_at: string;
  updated_at: string;
}

export interface DbFavorite {
  id: string;
  user_id: string;
  manga_id: string;
  anilist_id: number | null;
  title: string;
  cover_url: string;
  created_at: string;
}

export interface DbUserPreferences {
  id: string;
  user_id: string;
  reader_mode: 'vertical' | 'horizontal' | 'webtoon';
  reader_theme: 'light' | 'dark' | 'sepia';
  zoom: number;
  fit_width: boolean;
  preload_pages: number;
  show_progress: boolean;
  site_dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

// Auth Functions
export async function signUp(email: string, password: string, username?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username || email.split('@')[0],
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// Reading History Functions
export async function syncReadingHistory(
  userId: string,
  entry: {
    mangaId: string;
    anilistId?: number;
    title: string;
    coverUrl: string;
    lastChapterId: string;
    lastChapterNumber: string;
    lastPage: number;
  }
) {
  const { data, error } = await supabase
    .from('reading_history')
    .upsert(
      {
        user_id: userId,
        manga_id: entry.mangaId,
        anilist_id: entry.anilistId || null,
        title: entry.title,
        cover_url: entry.coverUrl,
        last_chapter_id: entry.lastChapterId,
        last_chapter_number: entry.lastChapterNumber,
        last_page: entry.lastPage,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,manga_id',
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReadingHistory(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('reading_history')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as DbReadingHistory[];
}

export async function deleteFromHistory(userId: string, mangaId: string) {
  const { error } = await supabase
    .from('reading_history')
    .delete()
    .eq('user_id', userId)
    .eq('manga_id', mangaId);

  if (error) throw error;
}

export async function clearReadingHistory(userId: string) {
  const { error } = await supabase
    .from('reading_history')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

// Favorites Functions
export async function addFavorite(
  userId: string,
  manga: {
    mangaId: string;
    anilistId?: number;
    title: string;
    coverUrl: string;
  }
) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      manga_id: manga.mangaId,
      anilist_id: manga.anilistId || null,
      title: manga.title,
      cover_url: manga.coverUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFavorite(userId: string, mangaId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('manga_id', mangaId);

  if (error) throw error;
}

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as DbFavorite[];
}

export async function isFavorite(userId: string, mangaId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('manga_id', mangaId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

// User Preferences Functions
export async function saveUserPreferences(
  userId: string,
  preferences: Partial<{
    readerMode: 'vertical' | 'horizontal' | 'webtoon';
    readerTheme: 'light' | 'dark' | 'sepia';
    zoom: number;
    fitWidth: boolean;
    preloadPages: number;
    showProgress: boolean;
    siteDarkMode: boolean;
  }>
) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        reader_mode: preferences.readerMode,
        reader_theme: preferences.readerTheme,
        zoom: preferences.zoom,
        fit_width: preferences.fitWidth,
        preload_pages: preferences.preloadPages,
        show_progress: preferences.showProgress,
        site_dark_mode: preferences.siteDarkMode,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as DbUserPreferences | null;
}
