import { supabase } from '../lib/supabase';

export interface WatchHistoryItem {
  id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  content_type: string;
  watched_at: string;
  progress: number;
}

export interface FavoriteItem {
  id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  content_type: string;
  vote_average: number;
  release_date: string | null;
  added_at: string;
}

export class DatabaseService {
  // Watch History Methods
  static async addToWatchHistory(
    userId: string,
    movieId: number,
    title: string,
    posterPath: string | null,
    contentType: string = 'movie',
    progress: number = 0
  ): Promise<boolean> {
    if (!userId) return false;

    try {
      const { data: existing } = await supabase
        .from('watch_history')
        .select('id')
        .eq('user_id', userId)
        .eq('movie_id', movieId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('watch_history')
          .update({ watched_at: new Date().toISOString(), progress })
          .eq('id', existing.id);
        return !error;
      } else {
        const { error } = await supabase
          .from('watch_history')
          .insert({ user_id: userId, movie_id: movieId, title, poster_path: posterPath, content_type: contentType, progress });
        return !error;
      }
    } catch (error) {
      console.error('Error adding to watch history:', error);
      return false;
    }
  }

  static async getWatchHistory(userId: string): Promise<WatchHistoryItem[]> {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', userId)
        .order('watched_at', { ascending: false })
        .limit(50);

      if (error) return [];
      return data || [];
    } catch (error) {
      console.error('Error fetching watch history:', error);
      return [];
    }
  }

  static async clearWatchHistory(userId: string): Promise<boolean> {
    if (!userId) return false;

    try {
      const { error } = await supabase.from('watch_history').delete().eq('user_id', userId);
      return !error;
    } catch (error) {
      console.error('Error clearing watch history:', error);
      return false;
    }
  }

  // Favorites Methods
  static async addToFavorites(
    userId: string,
    movieId: number,
    title: string,
    posterPath: string | null,
    contentType: string = 'movie',
    voteAverage: number = 0,
    releaseDate: string | null = null
  ): Promise<boolean> {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, movie_id: movieId, title, poster_path: posterPath, content_type: contentType, vote_average: voteAverage, release_date: releaseDate });
      return !error;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  static async removeFromFavorites(userId: string, movieId: number): Promise<boolean> {
    if (!userId) return false;

    try {
      const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('movie_id', movieId);
      return !error;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  static async getFavorites(userId: string): Promise<FavoriteItem[]> {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) return [];
      return data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  }

  static async isFavorite(userId: string, movieId: number): Promise<boolean> {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('movie_id', movieId)
        .single();
      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  static async clearFavorites(userId: string): Promise<boolean> {
    if (!userId) return false;

    try {
      const { error } = await supabase.from('favorites').delete().eq('user_id', userId);
      return !error;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }
}