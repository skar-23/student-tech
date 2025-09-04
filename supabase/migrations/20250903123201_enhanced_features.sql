-- Enhanced profiles table with college and skill info
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_year INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Note ratings and upvotes
CREATE TABLE IF NOT EXISTS public.note_ratings (
  id SERIAL PRIMARY KEY,
  note_id INTEGER NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(note_id, user_id)
);

-- Note upvotes
CREATE TABLE IF NOT EXISTS public.note_upvotes (
  id SERIAL PRIMARY KEY,
  note_id INTEGER NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(note_id, user_id)
);

-- User skill assessments for ML-based difficulty
CREATE TABLE IF NOT EXISTS public.user_assessments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  accuracy_rate DECIMAL(5,2) DEFAULT 0.0,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  last_assessment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic)
);

-- Question attempts for ML learning
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI-generated roadmaps
CREATE TABLE IF NOT EXISTS public.ai_roadmaps (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT NOT NULL, -- e.g., 'Full Stack Developer', 'Data Scientist'
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER, -- in weeks
  roadmap_data JSONB NOT NULL, -- AI-generated roadmap structure
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Roadmap progress tracking
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id INTEGER NOT NULL REFERENCES public.ai_roadmaps(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL, -- Reference to step in roadmap_data JSON
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, roadmap_id, step_id)
);

-- Update question_bank with more fields for ML
ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS estimated_time INTEGER; -- in minutes
ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS difficulty_score DECIMAL(3,2); -- 0-10 scale for ML

-- Update notes with college and enhanced metadata
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS author_year INTEGER;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS total_upvotes INTEGER DEFAULT 0;

-- Enable RLS for new tables
ALTER TABLE public.note_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all note ratings" ON public.note_ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert their own note ratings" ON public.note_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own note ratings" ON public.note_ratings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all note upvotes" ON public.note_upvotes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own note upvotes" ON public.note_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own note upvotes" ON public.note_upvotes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own assessments" ON public.user_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assessments" ON public.user_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assessments" ON public.user_assessments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own question attempts" ON public.question_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own question attempts" ON public.question_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own roadmaps" ON public.ai_roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own roadmaps" ON public.ai_roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own roadmaps" ON public.ai_roadmaps FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own roadmap progress" ON public.roadmap_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own roadmap progress" ON public.roadmap_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for updating note statistics
CREATE OR REPLACE FUNCTION update_note_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update rating average and count
  UPDATE public.notes 
  SET 
    rating_avg = (
      SELECT AVG(rating) FROM public.note_ratings WHERE note_id = COALESCE(NEW.note_id, OLD.note_id)
    ),
    total_ratings = (
      SELECT COUNT(*) FROM public.note_ratings WHERE note_id = COALESCE(NEW.note_id, OLD.note_id)
    )
  WHERE id = COALESCE(NEW.note_id, OLD.note_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_note_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update upvote count
  UPDATE public.notes 
  SET total_upvotes = (
    SELECT COUNT(*) FROM public.note_upvotes WHERE note_id = COALESCE(NEW.note_id, OLD.note_id)
  )
  WHERE id = COALESCE(NEW.note_id, OLD.note_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER note_ratings_update_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.note_ratings
  FOR EACH ROW EXECUTE FUNCTION update_note_stats();

CREATE TRIGGER note_upvotes_update_stats
  AFTER INSERT OR DELETE ON public.note_upvotes
  FOR EACH ROW EXECUTE FUNCTION update_note_upvotes();

-- Insert some sample enhanced question data
UPDATE public.question_bank 
SET 
  tags = CASE 
    WHEN topic = 'Arrays' THEN ARRAY['data-structures', 'arrays', 'indexing']
    WHEN topic = 'Linked Lists' THEN ARRAY['data-structures', 'pointers', 'linked-lists']
    WHEN topic = 'System Design' THEN ARRAY['system-design', 'scalability', 'architecture']
    ELSE ARRAY['programming', 'algorithms']
  END,
  estimated_time = CASE difficulty
    WHEN 'Easy' THEN 15
    WHEN 'Medium' THEN 30
    WHEN 'Hard' THEN 45
    ELSE 20
  END,
  difficulty_score = CASE difficulty
    WHEN 'Easy' THEN 3.0
    WHEN 'Medium' THEN 6.0
    WHEN 'Hard' THEN 9.0
    ELSE 5.0
  END
WHERE tags IS NULL;
