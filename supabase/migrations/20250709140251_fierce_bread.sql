/*
  # Database Schema for DeltaSilicon.Hub

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `password_hash` (text)
      - `is_admin` (boolean, default false)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamp)
      - `last_login` (timestamp)
      - `active_days` (integer, default 0)

    - `watch_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `movie_id` (integer)
      - `title` (text)
      - `poster_path` (text)
      - `content_type` (text)
      - `watched_at` (timestamp)
      - `progress` (integer, default 0)

    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `movie_id` (integer)
      - `title` (text)
      - `poster_path` (text)
      - `content_type` (text)
      - `vote_average` (real)
      - `release_date` (text)
      - `added_at` (timestamp)

    - `forum_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `message` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `company_updates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `content` (text)
      - `media_type` (text) -- 'text', 'image', 'video', 'audio'
      - `media_url` (text, nullable)
      - `thumbnail_url` (text, nullable)
      - `views` (integer, default 0)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add admin policies for company updates
</sql>

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  password_hash text NOT NULL,
  is_admin boolean DEFAULT false,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now(),
  active_days integer DEFAULT 0
);

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  movie_id integer NOT NULL,
  title text NOT NULL,
  poster_path text,
  content_type text DEFAULT 'movie',
  watched_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  movie_id integer NOT NULL,
  title text NOT NULL,
  poster_path text,
  content_type text DEFAULT 'movie',
  vote_average real DEFAULT 0,
  release_date text,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Create forum_messages table
CREATE TABLE IF NOT EXISTS forum_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create company_updates table
CREATE TABLE IF NOT EXISTS company_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  media_type text DEFAULT 'text',
  media_url text,
  thumbnail_url text,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_updates ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Watch history policies
CREATE POLICY "Users can manage own watch history"
  ON watch_history
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Favorites policies
CREATE POLICY "Users can manage own favorites"
  ON favorites
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Forum messages policies
CREATE POLICY "Anyone can read forum messages"
  ON forum_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create forum messages"
  ON forum_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own forum messages"
  ON forum_messages
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own forum messages"
  ON forum_messages
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Company updates policies
CREATE POLICY "Anyone can read company updates"
  ON company_updates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage company updates"
  ON company_updates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Insert admin user
INSERT INTO users (email, name, password_hash, is_admin) 
VALUES (
  'admin@ds.com', 
  'DeltaSilicon Admin', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'look2008'
  true
) ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history(watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_messages_created_at ON forum_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_updates_created_at ON company_updates(created_at DESC);