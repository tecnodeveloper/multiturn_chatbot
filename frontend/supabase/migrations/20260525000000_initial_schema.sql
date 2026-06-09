-- Initial Schema for MultiTurn AI Chatbot

-- 1. CHATS TABLE
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. FILES TABLE
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  type TEXT,
  size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own chats" ON chats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own messages" ON messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own files" ON files
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own feedback" ON feedback
  FOR ALL USING (auth.uid() = user_id);

-- Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_files', 'chat_files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own chat files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own chat files" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own chat files" ON storage.objects
  FOR DELETE USING (bucket_id = 'chat_files' AND auth.uid()::text = (storage.foldername(name))[1]);
