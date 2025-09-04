-- Drop foreign key constraints and update user_progress table
ALTER TABLE public.user_progress DROP CONSTRAINT IF EXISTS user_progress_topic_id_fkey;
ALTER TABLE public.user_progress DROP COLUMN IF EXISTS topic_id;

-- Drop the tables (order matters due to foreign key relationships)
DROP TABLE IF EXISTS public.roadmap_topics CASCADE;
DROP TABLE IF EXISTS public.roadmap_modules CASCADE;
