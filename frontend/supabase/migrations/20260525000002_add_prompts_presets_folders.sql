-- Migration to add Prompts, Presets, and Folders
-- Similar to chatbot-ui architecture

-- 1. FOLDERS TABLE
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'chats', 'prompts', 'presets', 'files', etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROMPTS TABLE
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PRESETS TABLE
CREATE TABLE IF NOT EXISTS presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    temperature REAL NOT NULL DEFAULT 0.7,
    context_length INTEGER NOT NULL DEFAULT 4096,
    include_profile_context BOOLEAN NOT NULL DEFAULT FALSE,
    include_workspace_instructions BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own folders" ON folders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own prompts" ON prompts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own presets" ON presets
    FOR ALL USING (auth.uid() = user_id);

-- Add folder_id to chats table if not exists (it should be added for organization)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'chats' AND COLUMN_NAME = 'folder_id') THEN
        ALTER TABLE chats ADD COLUMN folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add folder_id to files table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'files' AND COLUMN_NAME = 'folder_id') THEN
        ALTER TABLE files ADD COLUMN folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
    END IF;
END $$;
