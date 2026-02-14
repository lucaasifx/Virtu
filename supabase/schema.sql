-- =============================================
-- VIRTU APP - Database Schema for Supabase
-- Execute this SQL in Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. GAMIFICATION TABLE
CREATE TABLE IF NOT EXISTS gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    last_workout_date DATE,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);

-- 4. WORKOUTS TABLE (with JSONB for sets - optimized storage)
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    total_volume INTEGER,
    total_sets INTEGER,
    muscle_groups TEXT[],
    -- JSONB stores all sets data inline for efficiency
    -- Format: [{"exerciseId": "...", "sets": [{"weight": 80, "reps": 10, "rpe": 8}]}]
    exercises_data JSONB,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workout_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Hipertrofia',
    muscle_groups TEXT[] NOT NULL DEFAULT '{}',
    exercise_ids TEXT[] NOT NULL DEFAULT '{}',
    cover_muscle_group TEXT NOT NULL DEFAULT 'CHEST',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Gamification: users can only access their own gamification data
CREATE POLICY "Users can CRUD own gamification" ON gamification
    FOR ALL USING (auth.uid() = user_id);

-- Achievements: users can only access their own achievements
CREATE POLICY "Users can CRUD own achievements" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

-- Workouts: users can only access their own workouts
CREATE POLICY "Users can CRUD own workouts" ON workouts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own workout routines" ON workout_routines
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (new.id);
    
    INSERT INTO public.gamification (user_id)
    VALUES (new.id);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS workout_routines_touch_updated_at ON workout_routines;
CREATE TRIGGER workout_routines_touch_updated_at
    BEFORE UPDATE ON workout_routines
    FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();

-- =============================================
-- INDEXES (for performance)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_started_at ON workouts(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_routines_user_id ON workout_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_routines_updated_at ON workout_routines(updated_at DESC);

-- =============================================
-- MIGRATION: If you had workout_sets table, run this to drop it
-- =============================================
-- DROP TABLE IF EXISTS workout_sets;
