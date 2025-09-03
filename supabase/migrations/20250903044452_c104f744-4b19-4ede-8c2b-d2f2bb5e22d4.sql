-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roadmaps table
CREATE TABLE public.roadmaps (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roadmap_modules table
CREATE TABLE public.roadmap_modules (
  id SERIAL PRIMARY KEY,
  roadmap_id INTEGER NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roadmap_topics table
CREATE TABLE public.roadmap_topics (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES public.roadmap_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_url TEXT,
  resource_type TEXT CHECK (resource_type IN ('Video', 'Article', 'Practice')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_progress table
CREATE TABLE public.user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES public.roadmap_topics(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- Create notes table
CREATE TABLE public.notes (
  id SERIAL PRIMARY KEY,
  uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  subject_tag TEXT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question_bank table
CREATE TABLE public.question_bank (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  solution TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create RLS policies for roadmaps (public read)
CREATE POLICY "Roadmaps are viewable by everyone" 
ON public.roadmaps FOR SELECT 
USING (true);

-- Create RLS policies for roadmap_modules (public read)
CREATE POLICY "Roadmap modules are viewable by everyone" 
ON public.roadmap_modules FOR SELECT 
USING (true);

-- Create RLS policies for roadmap_topics (public read)
CREATE POLICY "Roadmap topics are viewable by everyone" 
ON public.roadmap_topics FOR SELECT 
USING (true);

-- Create RLS policies for user_progress
CREATE POLICY "Users can view their own progress" 
ON public.user_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.user_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
ON public.user_progress FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for notes
CREATE POLICY "Notes are viewable by everyone" 
ON public.notes FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own notes" 
ON public.notes FOR INSERT 
WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can update their own notes" 
ON public.notes FOR UPDATE 
USING (auth.uid() = uploader_id);

-- Create RLS policies for question_bank (public read)
CREATE POLICY "Question bank is viewable by everyone" 
ON public.question_bank FOR SELECT 
USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for notes files
INSERT INTO storage.buckets (id, name, public) VALUES ('notes-files', 'notes-files', false);

-- Create storage policies for notes files
CREATE POLICY "Users can upload their own note files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'notes-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view note files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'notes-files');

-- Insert sample data for roadmaps
INSERT INTO public.roadmaps (title, description, domain) VALUES
('Full Stack Web Development', 'Complete roadmap for becoming a full stack web developer', 'Web Dev'),
('Data Structures & Algorithms', 'Master DSA for coding interviews', 'Programming'),
('Machine Learning Basics', 'Introduction to ML concepts and implementation', 'ML'),
('System Design Fundamentals', 'Learn how to design scalable systems', 'System Design');

-- Insert sample modules for Full Stack roadmap
INSERT INTO public.roadmap_modules (roadmap_id, title, order_index) VALUES
(1, 'HTML & CSS Fundamentals', 1),
(1, 'JavaScript Essentials', 2),
(1, 'React Development', 3),
(1, 'Backend with Node.js', 4),
(1, 'Database Design', 5);

-- Insert sample topics for HTML & CSS module
INSERT INTO public.roadmap_topics (module_id, title, resource_url, resource_type, order_index) VALUES
(1, 'HTML Basics', 'https://developer.mozilla.org/en-US/docs/Web/HTML', 'Article', 1),
(1, 'CSS Fundamentals', 'https://developer.mozilla.org/en-US/docs/Web/CSS', 'Article', 2),
(1, 'Flexbox Layout', 'https://flexboxfroggy.com/', 'Practice', 3),
(1, 'CSS Grid', 'https://cssgridgarden.com/', 'Practice', 4);

-- Insert sample questions
INSERT INTO public.question_bank (question_text, solution, topic, difficulty) VALUES
('What is the time complexity of binary search?', 'O(log n) - Binary search divides the search space in half at each step.', 'Arrays', 'Easy'),
('Implement a function to reverse a linked list', 'Use three pointers: prev, current, and next. Iterate through the list and reverse the links.', 'Linked Lists', 'Medium'),
('What is the difference between REST and GraphQL?', 'REST uses multiple endpoints with fixed data structures, while GraphQL uses a single endpoint with flexible queries.', 'System Design', 'Medium');