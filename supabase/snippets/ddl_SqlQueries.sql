-- ==========================================
-- 1. CREATE CUSTOM ENUM TYPES
-- ==========================================
CREATE TYPE auth_type AS ENUM ('email', 'google');
CREATE TYPE message_sender AS ENUM ('user', 'bot');
CREATE TYPE session_phase_type AS ENUM ('start', 'middle', 'end');
CREATE TYPE correctness_type AS ENUM ('correct', 'partial', 'Incorrect');
CREATE TYPE length_classification AS ENUM ('short', 'To the point', 'lengthy');
CREATE TYPE llm_deployment_type AS ENUM ('GrokAPI', 'LocalDeploy');
CREATE TYPE domain_category_type AS ENUM ('Machine learning', 'Deep Learning', 'HealthCare', 'Ecommerce', 'Power System');

-- ==========================================
-- 2. CREATE TABLES (In topological dependency order)
-- ==========================================

-- User Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Can be null for Google OAuth users
    phone_number VARCHAR(50),
    image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type auth_type NOT NULL DEFAULT 'email'
);

-- Chat Session Table
CREATE TABLE chat_sessions (
    chat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    context TEXT,
    sidebar_title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files Table (Handles document attachments)
CREATE TABLE files (
    file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chat_sessions(chat_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    size_mb NUMERIC(4, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Enforces the max 2MB requirement directly at database level
    CONSTRAINT check_file_size CHECK (size_mb <= 2.00) 
);

-- Model Table (Tracks LLM configuration metadata)
CREATE TABLE models (
    model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(255) NOT NULL,
    llm_type llm_deployment_type NOT NULL DEFAULT 'LocalDeploy',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Domain Table (Master Lookup for cross-session topic metrics)
CREATE TABLE domains (
    domain_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category domain_category_type NOT NULL
);

-- Message Table (Stores multi-turn logs)
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chat_sessions(chat_id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(domain_id) ON DELETE SET NULL, -- Allows multi-topic turns in one chat
    sender message_sender NOT NULL,
    response TEXT NOT NULL, -- The text payload
    image_url TEXT,
    response_time FLOAT NOT NULL, -- Saved as numerical Float for mathematical averaging (FR17)
    session_phase session_phase_type NOT NULL, -- Tracks start/middle/end segmentation (FR16)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback Table (Mandatory evaluation tracking)
CREATE TABLE feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID UNIQUE NOT NULL REFERENCES messages(message_id) ON DELETE CASCADE, -- Tied directly to specific response
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 4), -- Enforces 1-4 validation rules
    comment TEXT,
    correctness correctness_type NOT NULL,
    length_type length_classification NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Summary Table (Aggregated session metadata for dashboard)
CREATE TABLE analytics_summaries (
    summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID UNIQUE NOT NULL REFERENCES chat_sessions(chat_id) ON DELETE CASCADE,
    dominant_domain_id UUID REFERENCES domains(domain_id) ON DELETE SET NULL,
    avg_rating NUMERIC(3, 2),
    total_duration_sec FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



SELECT * FROM users;