BEGIN;

ALTER TABLE public.gamification
    ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'gamification_user_id_fkey'
          AND conrelid = 'public.gamification'::regclass
    ) THEN
        ALTER TABLE public.gamification
            ADD CONSTRAINT gamification_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END
$$;

DO $$
DECLARE
    pk_name TEXT;
BEGIN
    SELECT conname
    INTO pk_name
    FROM pg_constraint
    WHERE conrelid = 'public.gamification'::regclass
      AND contype = 'p'
    LIMIT 1;

    IF pk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.gamification DROP CONSTRAINT %I', pk_name);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'gamification_pkey'
          AND conrelid = 'public.gamification'::regclass
    ) THEN
        ALTER TABLE public.gamification
            ADD CONSTRAINT gamification_pkey PRIMARY KEY (user_id);
    END IF;
END
$$;

ALTER TABLE public.gamification
    DROP COLUMN IF EXISTS id;

COMMIT;
