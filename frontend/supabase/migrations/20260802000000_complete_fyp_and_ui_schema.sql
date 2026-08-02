-- Migration: Complete FYP & UI Schema Alignment
-- Includes missing Domain, Analytics_Summary, per-turn feedback, message metrics, and UI tables (folders, prompts, presets)

-- 1. ENUMS & TYPE CREATION
DO $$ BEGIN
  CREATE TYPE auth_provider_type AS ENUM ('email', 'google');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE session_phase_type AS ENUM ('start', 'middle', 'end');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE domain_category_type AS ENUM ('Machine Learning', 'Deep Learning', 'Healthcare AI', 'Power Systems', 'E-commerce AI');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. UPDATE PROFILES TABLE
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS auth_type auth_provider_type DEFAULT 'google';

-- 3. UPDATE CHATS TABLE
ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS context TEXT;

-- 4. CREATE DOMAINS TABLE
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  category domain_category_type NOT NULL DEFAULT 'Machine Learning',
  feedback_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. UPDATE MESSAGES TABLE
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS response_time DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS session_phase session_phase_type DEFAULT 'middle',
  ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL;

-- 6. UPDATE FEEDBACK TABLE
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE;

-- Add backlink from domain to feedback if needed
ALTER TABLE public.domains
  ADD CONSTRAINT fk_domain_feedback FOREIGN KEY (feedback_id) REFERENCES public.feedback(id) ON DELETE SET NULL;

-- 7. CREATE ANALYTICS SUMMARY TABLE
CREATE TABLE IF NOT EXISTS public.analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
  feedback_id UUID REFERENCES public.feedback(id) ON DELETE SET NULL,
  summary_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CREATE UI EXTENSION TABLES (folders, prompts, presets)
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  temperature DOUBLE PRECISION NOT NULL DEFAULT 0.7,
  context_length INTEGER NOT NULL DEFAULT 4096,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;

-- Policies for domains
CREATE POLICY "Users can manage domains for their chats" ON public.domains
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = domains.chat_id AND chats.user_id = auth.uid()
    )
  );

-- Policies for analytics_summary
CREATE POLICY "Users can manage analytics summary for their chats" ON public.analytics_summary
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = analytics_summary.chat_id AND chats.user_id = auth.uid()
    )
  );

-- Policies for folders
CREATE POLICY "Users can manage their own folders" ON public.folders
  FOR ALL USING (auth.uid() = user_id);

-- Policies for prompts
CREATE POLICY "Users can manage their own prompts" ON public.prompts
  FOR ALL USING (auth.uid() = user_id);

-- Policies for presets
CREATE POLICY "Users can manage their own presets" ON public.presets
  FOR ALL USING (auth.uid() = user_id);

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_domain_id ON public.messages(domain_id);
CREATE INDEX IF NOT EXISTS idx_feedback_chat_id ON public.feedback(chat_id);
CREATE INDEX IF NOT EXISTS idx_feedback_message_id ON public.feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_domains_chat_id ON public.domains(chat_id);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_chat_id ON public.analytics_summary(chat_id);
