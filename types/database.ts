/**
 * Database Types for Preserving Connections
 * Auto-generated from Supabase schema with manual enhancements
 *
 * These types provide full type safety for database operations
 * with Supabase and ensure proper RLS policy adherence.
 */

// =====================================================
// ENUMS
// =====================================================

export type PersonaStatus = 'in_progress' | 'completed';
export type MediaType = 'photo' | 'video' | 'audio';
export type ConversationStatus = 'active' | 'archived';
export type MessageRole = 'user' | 'persona' | 'system';
export type CrisisLevel = 'low' | 'medium' | 'high';
export type ReviewStatus = 'pending' | 'reviewed' | 'escalated' | 'resolved';
export type MemoryType = 'episodic' | 'semantic' | 'preference' | 'boundary' | 'relationship' | 'legacy_import' | 'questionnaire';
export type MemorySource = 'onboarding' | 'message' | 'feedback' | 'questionnaire' | 'obituary' | 'user_input';
export type FeedbackKind = 'thumbs_up' | 'thumbs_down' | 'correct' | 'edit' | 'pin' | 'forget';
export type FeedbackStatus = 'pending' | 'applied';
export type MetricWindow = '7d' | '30d' | '90d' | 'all';
export type ResponseLength = 'short' | 'medium' | 'long';
export type ConversationStyle = 'formal' | 'casual' | 'balanced';
export type PersonaVisibility = 'private' | 'family' | 'public';
export type MemoryRetention = '30d' | '1y' | 'forever';
export type Theme = 'light' | 'dark' | 'system';

// =====================================================
// TABLE TYPES
// =====================================================

export interface Persona {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  created_at: string;
  updated_at: string;
  onboarding_approach: string;
  status: PersonaStatus;
  onboarding_data: Record<string, any>;
}

export interface PersonaMedia {
  id: string;
  persona_id: string;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  url: string;
  media_type: MediaType;
  created_at: string;
}

export interface OnboardingSession {
  id: string;
  user_id: string;
  persona_id: string | null;
  approach: string;
  current_step: string;
  step_data: Record<string, any>;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireProgress {
  id: string;
  user_id: string;
  persona_id: string;
  current_step: number;
  responses: Record<string, any>;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  persona_id: string;
  title: string;
  started_at: string;
  last_message_at: string;
  status: ConversationStatus;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  tokens: number | null;
  meta: Record<string, any>;

  // Crisis Detection Fields
  flagged_for_review: boolean;
  crisis_level: CrisisLevel | null;
  crisis_keywords: string[] | null;
  intervention_delivered: boolean;
  review_status: ReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;

  created_at: string;
}

export interface Memory {
  id: string;
  persona_id: string;
  type: MemoryType;
  content: string;
  source: MemorySource;
  salience: number;
  last_used_at: string | null;
  usage_count: number;
  tags: string[];
  embedding: Record<string, any> | null;
  message_id: string | null;
  conversation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  persona_id: string;
  conversation_id: string | null;
  message_id: string | null;
  memory_id: string | null;
  kind: FeedbackKind;
  payload: Record<string, any> | null;
  status: FeedbackStatus;
  created_at: string;
}

export interface PatternMetric {
  id: string;
  persona_id: string;
  metric: string;
  window: MetricWindow;
  value: Record<string, any>;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;

  // Account Settings
  display_name: string | null;
  preferred_language: string;
  timezone: string;

  // Notification Preferences
  email_notifications: boolean;
  push_notifications: boolean;
  conversation_notifications: boolean;
  weekly_digest: boolean;

  // Privacy Controls
  data_sharing: boolean;
  analytics_opt_in: boolean;
  allow_persona_sharing: boolean;
  public_profile: boolean;

  // AI Model Preferences
  preferred_model: string;
  response_length: ResponseLength;
  conversation_style: ConversationStyle;
  creativity_level: number;

  // Persona Defaults
  default_persona_visibility: PersonaVisibility;
  default_memory_retention: MemoryRetention;
  auto_generate_insights: boolean;

  // Theme and UI
  theme: Theme;
  compact_mode: boolean;
  sidebar_collapsed: boolean;

  // AI Feedback and Preferences
  forbidden_terms: string[];
  language_corrections: Record<string, string>;
  advanced_settings: Record<string, any>;

  created_at: string;
  updated_at: string;
}

// =====================================================
// INSERT TYPES (for creating new records)
// =====================================================

export type InsertPersona = Omit<Persona, 'id' | 'created_at' | 'updated_at'>;
export type InsertPersonaMedia = Omit<PersonaMedia, 'id' | 'created_at'>;
export type InsertOnboardingSession = Omit<OnboardingSession, 'id' | 'created_at' | 'updated_at'>;
export type InsertQuestionnaireProgress = Omit<QuestionnaireProgress, 'id' | 'created_at' | 'updated_at'>;
export type InsertConversation = Omit<Conversation, 'id' | 'created_at'>;
export type InsertMessage = Omit<Message, 'id' | 'created_at'>;
export type InsertMemory = Omit<Memory, 'id' | 'created_at' | 'updated_at'>;
export type InsertFeedback = Omit<Feedback, 'id' | 'created_at'>;
export type InsertPatternMetric = Omit<PatternMetric, 'id' | 'updated_at'>;
export type InsertUserSettings = Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;

// =====================================================
// UPDATE TYPES (partial updates)
// =====================================================

export type UpdatePersona = Partial<Omit<Persona, 'id' | 'user_id' | 'created_at'>>;
export type UpdatePersonaMedia = Partial<Omit<PersonaMedia, 'id' | 'persona_id' | 'created_at'>>;
export type UpdateOnboardingSession = Partial<Omit<OnboardingSession, 'id' | 'user_id' | 'created_at'>>;
export type UpdateQuestionnaireProgress = Partial<Omit<QuestionnaireProgress, 'id' | 'user_id' | 'persona_id' | 'created_at'>>;
export type UpdateConversation = Partial<Omit<Conversation, 'id' | 'user_id' | 'persona_id' | 'created_at'>>;
export type UpdateMessage = Partial<Omit<Message, 'id' | 'conversation_id' | 'created_at'>>;
export type UpdateMemory = Partial<Omit<Memory, 'id' | 'persona_id' | 'created_at'>>;
export type UpdateFeedback = Partial<Omit<Feedback, 'id' | 'user_id' | 'persona_id' | 'created_at'>>;
export type UpdatePatternMetric = Partial<Omit<PatternMetric, 'id' | 'persona_id'>>;
export type UpdateUserSettings = Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at'>>;

// =====================================================
// QUERY RESULT TYPES (with joins)
// =====================================================

export interface PersonaWithMedia extends Persona {
  media: PersonaMedia[];
}

export interface PersonaWithStats extends Persona {
  memory_count: number;
  conversation_count: number;
  total_messages: number;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  persona: Persona;
}

export interface ConversationListItem extends Conversation {
  persona: Persona;
  last_message_content: string | null;
  unread_count: number;
}

export interface MessageWithCrisisInfo extends Message {
  conversation: Conversation;
  persona: Persona;
}

export interface MemoryWithContext extends Memory {
  persona: Persona;
  conversation: Conversation | null;
  message: Message | null;
}

// =====================================================
// CRISIS DETECTION TYPES
// =====================================================

export interface CrisisDetectionResult {
  is_crisis: boolean;
  detected_phrases: string[];
  crisis_level: CrisisLevel | null;
  recommended_response: string | null;
  intervention_required: boolean;
}

export interface CrisisResource {
  name: string;
  phone: string;
  text?: string;
  url?: string;
  country: string;
  hours: string;
}

export interface FlaggedMessage extends Message {
  conversation_title: string;
  persona_name: string;
  user_email: string;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

export interface ChatResponse {
  response: string;
  model: string;
  cached: boolean;
  usage?: {
    tokens: {
      input: number;
      output: number;
    };
    daily_cost: number;
    remaining_budget: number;
    usage_percentage: number;
  };
  crisis_intervention?: boolean;
  crisis_level?: CrisisLevel;
  resources?: CrisisResource[];
  ai_response_blocked?: boolean;
}

// =====================================================
// DATABASE CLIENT TYPES (Supabase)
// =====================================================

export interface Database {
  public: {
    Tables: {
      personas: {
        Row: Persona;
        Insert: InsertPersona;
        Update: UpdatePersona;
      };
      persona_media: {
        Row: PersonaMedia;
        Insert: InsertPersonaMedia;
        Update: UpdatePersonaMedia;
      };
      onboarding_sessions: {
        Row: OnboardingSession;
        Insert: InsertOnboardingSession;
        Update: UpdateOnboardingSession;
      };
      questionnaire_progress: {
        Row: QuestionnaireProgress;
        Insert: InsertQuestionnaireProgress;
        Update: UpdateQuestionnaireProgress;
      };
      conversations: {
        Row: Conversation;
        Insert: InsertConversation;
        Update: UpdateConversation;
      };
      messages: {
        Row: Message;
        Insert: InsertMessage;
        Update: UpdateMessage;
      };
      memories: {
        Row: Memory;
        Insert: InsertMemory;
        Update: UpdateMemory;
      };
      feedback: {
        Row: Feedback;
        Insert: InsertFeedback;
        Update: UpdateFeedback;
      };
      pattern_metrics: {
        Row: PatternMetric;
        Insert: InsertPatternMetric;
        Update: UpdatePatternMetric;
      };
      user_settings: {
        Row: UserSettings;
        Insert: InsertUserSettings;
        Update: UpdateUserSettings;
      };
    };
    Views: {};
    Functions: {
      get_user_personas: {
        Args: {};
        Returns: Persona[];
      };
      user_owns_persona: {
        Args: { p_persona_id: string };
        Returns: boolean;
      };
    };
    Enums: {};
  };
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Type guard to check if a message is flagged for crisis review
export function isCrisisFlagged(message: Message): message is Message & { flagged_for_review: true; crisis_level: CrisisLevel } {
  return message.flagged_for_review === true && message.crisis_level !== null;
}

// Type guard to check if crisis intervention was delivered
export function hasInterventionDelivered(message: Message): message is Message & { intervention_delivered: true } {
  return message.intervention_delivered === true;
}

// Exported for convenient access
export default Database;
