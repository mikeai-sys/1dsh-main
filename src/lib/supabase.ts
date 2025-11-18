import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlwumcgmzdadwrnbdnhz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsd3VtY2dtemRhZHdybmJkbmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjc1MjQsImV4cCI6MjA2NzY0MzUyNH0.29IvnlBkw4exqkXKuXlzvriqGAZ-34hnNlTM3y675Do';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          password_hash: string;
          is_admin: boolean;
          avatar_url: string | null;
          created_at: string;
          last_login: string;
          active_days: number;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          password_hash: string;
          is_admin?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          last_login?: string;
          active_days?: number;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          password_hash?: string;
          is_admin?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          last_login?: string;
          active_days?: number;
        };
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          movie_id: number;
          title: string;
          poster_path: string | null;
          content_type: string;
          watched_at: string;
          progress: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          movie_id: number;
          title: string;
          poster_path?: string | null;
          content_type?: string;
          watched_at?: string;
          progress?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          movie_id?: number;
          title?: string;
          poster_path?: string | null;
          content_type?: string;
          watched_at?: string;
          progress?: number;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          movie_id: number;
          title: string;
          poster_path: string | null;
          content_type: string;
          vote_average: number;
          release_date: string | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          movie_id: number;
          title: string;
          poster_path?: string | null;
          content_type?: string;
          vote_average?: number;
          release_date?: string | null;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          movie_id?: number;
          title?: string;
          poster_path?: string | null;
          content_type?: string;
          vote_average?: number;
          release_date?: string | null;
          added_at?: string;
        };
      };
      forum_messages: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_updates: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          media_type: string;
          media_url: string | null;
          thumbnail_url: string | null;
          views: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          media_type?: string;
          media_url?: string | null;
          thumbnail_url?: string | null;
          views?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          media_type?: string;
          media_url?: string | null;
          thumbnail_url?: string | null;
          views?: number;
          created_at?: string;
        };
      };
    };
  };
};