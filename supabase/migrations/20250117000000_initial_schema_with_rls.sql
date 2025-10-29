-- =====================================================
-- PRESERVING CONNECTIONS DATABASE SCHEMA WITH RLS
-- Apple/Microsoft-Grade Quality
-- =====================================================
--
-- This migration creates the complete database schema for
-- the grief-tech platform with proper Row Level Security,
-- foreign keys, indexes, and Supabase auth integration.
--
-- Tables:
-- - personas: Deceased loved ones
-- - persona_media: Photos, videos, audio files
-- - onboarding_sessions: User onboarding progress
-- - questionnaire_progress: Advanced questionnaire state
-- - conversations: Chat sessions
-- - messages: Individual messages with crisis detection
-- - memories: Multi-source memory storage
-- - feedback: User corrections and preferences
-- - pattern_metrics: AI behavior tracking
-- - user_settings: User preferences
--
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PERSONAS TABLE
-- Core table for deceased loved ones
-- =====================================================

CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  onboarding_approach TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress' NOT NULL CHECK (status IN ('in_progress', 'completed')),
  onboarding_data JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT personas_name_check CHECK (char_length(name) > 0 AND char_length(name) <= 200),
  CONSTRAINT personas_relationship_check CHECK (char_length(relationship) > 0 AND char_length(relationship) <= 100)
);

-- Indexes for performance
CREATE INDEX idx_personas_user_id ON personas(user_id);
CREATE INDEX idx_personas_status ON personas(status) WHERE status = 'in_progress';
CREATE INDEX idx_personas_created_at ON personas(created_at DESC);

-- =====================================================
-- PERSONA MEDIA TABLE
-- Photos, videos, audio of deceased
-- =====================================================

CREATE TABLE IF NOT EXISTS persona_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  size BIGINT NOT NULL CHECK (size > 0 AND size <= 10485760), -- 10MB limit
  url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'audio')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT media_filename_check CHECK (char_length(filename) > 0),
  CONSTRAINT media_url_check CHECK (char_length(url) > 0)
);

-- Indexes
CREATE INDEX idx_persona_media_persona_id ON persona_media(persona_id);
CREATE INDEX idx_persona_media_type ON persona_media(media_type);

-- =====================================================
-- ONBOARDING SESSIONS TABLE
-- Track user progress through onboarding flows
-- =====================================================

CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  approach TEXT NOT NULL,
  current_step TEXT NOT NULL,
  step_data JSONB DEFAULT '{}'::jsonb,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_onboarding_sessions_user_id ON onboarding_sessions(user_id);
CREATE INDEX idx_onboarding_sessions_persona_id ON onboarding_sessions(persona_id) WHERE persona_id IS NOT NULL;
CREATE INDEX idx_onboarding_sessions_completed ON onboarding_sessions(is_completed) WHERE is_completed = false;

-- =====================================================
-- QUESTIONNAIRE PROGRESS TABLE
-- Save/resume advanced questionnaire
-- =====================================================

CREATE TABLE IF NOT EXISTS questionnaire_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0 NOT NULL CHECK (current_step >= 0),
  responses JSONB DEFAULT '{}'::jsonb NOT NULL,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One progress per user per persona
  CONSTRAINT questionnaire_progress_user_persona_unique UNIQUE(user_id, persona_id)
);

-- Indexes
CREATE INDEX idx_questionnaire_progress_user_id ON questionnaire_progress(user_id);
CREATE INDEX idx_questionnaire_progress_persona_id ON questionnaire_progress(persona_id);

-- =====================================================
-- CONVERSATIONS TABLE
-- Chat sessions between user and persona
-- =====================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 500),
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_persona_id ON conversations(persona_id);
CREATE INDEX idx_conversations_user_persona_status ON conversations(user_id, persona_id, status);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_status ON conversations(status) WHERE status = 'active';

-- =====================================================
-- MESSAGES TABLE
-- Individual chat messages with crisis detection
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'persona', 'system')),
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 50000),
  tokens INTEGER CHECK (tokens >= 0),
  meta JSONB DEFAULT '{}'::jsonb,

  -- Crisis Detection Fields (25 Commandments - Tier 1)
  flagged_for_review BOOLEAN DEFAULT false NOT NULL,
  crisis_level TEXT CHECK (crisis_level IN ('low', 'medium', 'high')),
  crisis_keywords TEXT[],
  intervention_delivered BOOLEAN DEFAULT false NOT NULL,
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed', 'escalated', 'resolved')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance and crisis monitoring
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_conversation_time ON messages(conversation_id, created_at, id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_crisis_review ON messages(flagged_for_review, review_status, crisis_level) WHERE flagged_for_review = true;
CREATE INDEX idx_messages_crisis_level ON messages(crisis_level) WHERE crisis_level IS NOT NULL;
CREATE INDEX idx_messages_review_status ON messages(review_status) WHERE review_status != 'reviewed';

-- =====================================================
-- MEMORIES TABLE
-- Multi-source memory storage with semantic search
-- =====================================================

CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('episodic', 'semantic', 'preference', 'boundary', 'relationship', 'legacy_import', 'questionnaire')),
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 10000),
  source TEXT NOT NULL CHECK (source IN ('onboarding', 'message', 'feedback', 'questionnaire', 'obituary', 'user_input')),
  salience REAL DEFAULT 1.0 NOT NULL CHECK (salience >= 0 AND salience <= 10),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0 NOT NULL CHECK (usage_count >= 0),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  embedding JSONB, -- For vector similarity search
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_memories_persona_id ON memories(persona_id);
CREATE INDEX idx_memories_type ON memories(type);
CREATE INDEX idx_memories_source ON memories(source);
CREATE INDEX idx_memories_salience ON memories(salience DESC);
CREATE INDEX idx_memories_tags ON memories USING GIN(tags);
CREATE INDEX idx_memories_updated_at ON memories(updated_at DESC);

-- =====================================================
-- FEEDBACK TABLE
-- User corrections and AI behavior preferences
-- =====================================================

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  memory_id UUID REFERENCES memories(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('thumbs_up', 'thumbs_down', 'correct', 'edit', 'pin', 'forget')),
  payload JSONB,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'applied')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_persona_id ON feedback(persona_id);
CREATE INDEX idx_feedback_conversation_id ON feedback(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX idx_feedback_kind ON feedback(kind);
CREATE INDEX idx_feedback_status ON feedback(status) WHERE status = 'pending';
CREATE INDEX idx_feedback_persona_conversation_message ON feedback(persona_id, conversation_id, message_id);

-- =====================================================
-- PATTERN METRICS TABLE
-- Track AI behavior patterns over time
-- =====================================================

CREATE TABLE IF NOT EXISTS pattern_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  window TEXT NOT NULL CHECK (window IN ('7d', '30d', '90d', 'all')),
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One metric per persona per window
  CONSTRAINT pattern_metrics_persona_metric_window_unique UNIQUE(persona_id, metric, window)
);

-- Indexes
CREATE INDEX idx_pattern_metrics_persona_id ON pattern_metrics(persona_id);
CREATE INDEX idx_pattern_metrics_metric ON pattern_metrics(metric);
CREATE INDEX idx_pattern_metrics_window ON pattern_metrics(window);

-- =====================================================
-- USER SETTINGS TABLE
-- User preferences and configuration
-- =====================================================

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Account Settings
  display_name TEXT CHECK (char_length(display_name) <= 100),
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',

  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  conversation_notifications BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,

  -- Privacy Controls
  data_sharing BOOLEAN DEFAULT false,
  analytics_opt_in BOOLEAN DEFAULT true,
  allow_persona_sharing BOOLEAN DEFAULT false,
  public_profile BOOLEAN DEFAULT false,

  -- AI Model Preferences
  preferred_model TEXT DEFAULT 'gpt-3.5-turbo',
  response_length TEXT DEFAULT 'medium' CHECK (response_length IN ('short', 'medium', 'long')),
  conversation_style TEXT DEFAULT 'balanced' CHECK (conversation_style IN ('formal', 'casual', 'balanced')),
  creativity_level REAL DEFAULT 0.7 CHECK (creativity_level >= 0 AND creativity_level <= 1),

  -- Persona Defaults
  default_persona_visibility TEXT DEFAULT 'private' CHECK (default_persona_visibility IN ('private', 'family', 'public')),
  default_memory_retention TEXT DEFAULT 'forever' CHECK (default_memory_retention IN ('30d', '1y', 'forever')),
  auto_generate_insights BOOLEAN DEFAULT true,

  -- Theme and UI
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  compact_mode BOOLEAN DEFAULT false,
  sidebar_collapsed BOOLEAN DEFAULT false,

  -- AI Feedback and Preferences
  forbidden_terms TEXT[] DEFAULT ARRAY[]::TEXT[],
  language_corrections JSONB DEFAULT '{}'::jsonb,
  advanced_settings JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - PERSONAS
-- Users can only access their own personas
-- =====================================================

CREATE POLICY "Users can view their own personas"
  ON personas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personas"
  ON personas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personas"
  ON personas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personas"
  ON personas FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - PERSONA MEDIA
-- Users can only access media for their personas
-- =====================================================

CREATE POLICY "Users can view media for their personas"
  ON persona_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = persona_media.persona_id
        AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert media for their personas"
  ON persona_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = persona_media.persona_id
        AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update media for their personas"
  ON persona_media FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = persona_media.persona_id
        AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete media for their personas"
  ON persona_media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = persona_media.persona_id
        AND personas.user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES - ONBOARDING SESSIONS
-- Users can only access their own onboarding sessions
-- =====================================================

CREATE POLICY "Users can view their own onboarding sessions"
  ON onboarding_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding sessions"
  ON onboarding_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding sessions"
  ON onboarding_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own onboarding sessions"
  ON onboarding_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - QUESTIONNAIRE PROGRESS
-- Users can only access their own questionnaire progress
-- =====================================================

CREATE POLICY "Users can view their own questionnaire progress"
  ON questionnaire_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaire progress"
  ON questionnaire_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaire progress"
  ON questionnaire_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questionnaire progress"
  ON questionnaire_progress FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - CONVERSATIONS
-- Users can only access their own conversations
-- =====================================================

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - MESSAGES
-- Users can only access messages from their conversations
-- Admins can view flagged messages for review
-- =====================================================

CREATE POLICY "Users can view messages from their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view flagged messages"
  ON messages FOR SELECT
  USING (
    flagged_for_review = true
    AND auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update flagged messages"
  ON messages FOR UPDATE
  USING (
    flagged_for_review = true
    AND auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users can delete messages from their conversations"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES - MEMORIES
-- Users can only access memories for their personas
-- =====================================================

CREATE POLICY "Users can view memories for their personas"
  ON memories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = memories.persona_id
        AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert memories for their personas"
  ON memories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = memories.persona_id
        AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update memories for their personas"
  ON memories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = memories.persona_id
        AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete memories for their personas"
  ON memories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = memories.persona_id
        AND personas.user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES - FEEDBACK
-- Users can only access their own feedback
-- =====================================================

CREATE POLICY "Users can view their own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON feedback FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON feedback FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - PATTERN METRICS
-- Users can only access metrics for their personas
-- =====================================================

CREATE POLICY "Users can view pattern metrics for their personas"
  ON pattern_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = pattern_metrics.persona_id
        AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pattern metrics for their personas"
  ON pattern_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = pattern_metrics.persona_id
        AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pattern metrics for their personas"
  ON pattern_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = pattern_metrics.persona_id
        AND personas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pattern metrics for their personas"
  ON pattern_metrics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = pattern_metrics.persona_id
        AND personas.user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES - USER SETTINGS
-- Users can only access their own settings
-- =====================================================

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_personas_updated_at
  BEFORE UPDATE ON personas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_sessions_updated_at
  BEFORE UPDATE ON onboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaire_progress_updated_at
  BEFORE UPDATE ON questionnaire_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pattern_metrics_updated_at
  BEFORE UPDATE ON pattern_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get current user's personas
CREATE OR REPLACE FUNCTION get_user_personas()
RETURNS SETOF personas AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM personas
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns persona
CREATE OR REPLACE FUNCTION user_owns_persona(p_persona_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM personas
    WHERE id = p_persona_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE personas IS 'Stores information about deceased loved ones';
COMMENT ON TABLE persona_media IS 'Photos, videos, and audio files of deceased persons';
COMMENT ON TABLE onboarding_sessions IS 'Tracks user progress through persona creation flows';
COMMENT ON TABLE questionnaire_progress IS 'Saves partial progress through advanced questionnaires';
COMMENT ON TABLE conversations IS 'Chat sessions between users and AI personas';
COMMENT ON TABLE messages IS 'Individual messages with crisis detection and safety flagging';
COMMENT ON TABLE memories IS 'Multi-source memory storage with semantic search capabilities';
COMMENT ON TABLE feedback IS 'User corrections and AI behavior preferences';
COMMENT ON TABLE pattern_metrics IS 'Tracks AI behavior patterns and evolution over time';
COMMENT ON TABLE user_settings IS 'User preferences, notifications, and AI configuration';

COMMENT ON COLUMN messages.flagged_for_review IS 'Whether message needs human review (25 Commandments - Rule 1)';
COMMENT ON COLUMN messages.crisis_level IS 'Crisis severity: low (dependency), medium (self-harm), high (suicidal)';
COMMENT ON COLUMN messages.crisis_keywords IS 'Specific phrases that triggered crisis detection';
COMMENT ON COLUMN messages.intervention_delivered IS 'Whether crisis resources were provided to user';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
