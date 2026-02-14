BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.workout_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Hipertrofia',
    muscle_groups TEXT[] NOT NULL DEFAULT '{}',
    exercise_ids TEXT[] NOT NULL DEFAULT '{}',
    cover_muscle_group TEXT NOT NULL DEFAULT 'CHEST',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_routines
    ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS user_id UUID,
    ADD COLUMN IF NOT EXISTS title TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Hipertrofia',
    ADD COLUMN IF NOT EXISTS muscle_groups TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS exercise_ids TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS cover_muscle_group TEXT DEFAULT 'CHEST',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'workout_routines_pkey'
          AND conrelid = 'public.workout_routines'::regclass
    ) THEN
        ALTER TABLE public.workout_routines
            ADD CONSTRAINT workout_routines_pkey PRIMARY KEY (id);
    END IF;
END
$$;

UPDATE public.workout_routines SET category = 'Hipertrofia' WHERE category IS NULL;
UPDATE public.workout_routines SET muscle_groups = '{}' WHERE muscle_groups IS NULL;
UPDATE public.workout_routines SET exercise_ids = '{}' WHERE exercise_ids IS NULL;
UPDATE public.workout_routines SET cover_muscle_group = 'CHEST' WHERE cover_muscle_group IS NULL;
UPDATE public.workout_routines SET created_at = now() WHERE created_at IS NULL;
UPDATE public.workout_routines SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE public.workout_routines
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN category SET DEFAULT 'Hipertrofia',
    ALTER COLUMN muscle_groups SET DEFAULT '{}',
    ALTER COLUMN exercise_ids SET DEFAULT '{}',
    ALTER COLUMN cover_muscle_group SET DEFAULT 'CHEST',
    ALTER COLUMN created_at SET DEFAULT now(),
    ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.workout_routines
    ALTER COLUMN id SET NOT NULL,
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN title SET NOT NULL,
    ALTER COLUMN category SET NOT NULL,
    ALTER COLUMN muscle_groups SET NOT NULL,
    ALTER COLUMN exercise_ids SET NOT NULL,
    ALTER COLUMN cover_muscle_group SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'workout_routines_user_id_fkey'
          AND conrelid = 'public.workout_routines'::regclass
    ) THEN
        ALTER TABLE public.workout_routines
            ADD CONSTRAINT workout_routines_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END
$$;

ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'workout_routines'
          AND policyname = 'Users can CRUD own workout routines'
    ) THEN
        CREATE POLICY "Users can CRUD own workout routines"
            ON public.workout_routines
            FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'workout_routines_touch_updated_at'
          AND tgrelid = 'public.workout_routines'::regclass
    ) THEN
        CREATE TRIGGER workout_routines_touch_updated_at
        BEFORE UPDATE ON public.workout_routines
        FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_workout_routines_user_id
    ON public.workout_routines(user_id);

CREATE INDEX IF NOT EXISTS idx_workout_routines_updated_at
    ON public.workout_routines(updated_at DESC);

COMMIT;
