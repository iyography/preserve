/**
 * Supabase Helper Functions with RLS Support
 * Apple/Microsoft-Grade Quality
 *
 * These utilities provide type-safe database operations
 * that work seamlessly with Row Level Security policies.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

// =====================================================
// SUPABASE CLIENT CONFIGURATION
// =====================================================

// Server-side client with service role (bypasses RLS - use carefully!)
export function getSupabaseServiceClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Client-side or user-authenticated client (respects RLS)
export function getSupabaseClient(accessToken?: string): SupabaseClient<Database> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration');
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey);

  // Set the auth token if provided
  if (accessToken) {
    client.auth.setSession({
      access_token: accessToken,
      refresh_token: '' // Not needed for server-side operations
    });
  }

  return client;
}

// =====================================================
// RLS-AWARE QUERY HELPERS
// =====================================================

/**
 * Check if user owns a persona (respects RLS)
 */
export async function userOwnsPersona(
  client: SupabaseClient<Database>,
  personaId: string
): Promise<boolean> {
  const { data, error } = await client
    .rpc('user_owns_persona', { p_persona_id: personaId });

  if (error) {
    console.error('Error checking persona ownership:', error);
    return false;
  }

  return data === true;
}

/**
 * Get user's personas (automatically filtered by RLS)
 */
export async function getUserPersonas(
  client: SupabaseClient<Database>
) {
  const { data, error } = await client
    .from('personas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch personas: ${error.message}`);
  }

  return data;
}

/**
 * Get persona with stats (memory count, conversation count)
 */
export async function getPersonaWithStats(
  client: SupabaseClient<Database>,
  personaId: string
) {
  const [persona, memoryCount, conversationCount] = await Promise.all([
    client.from('personas').select('*').eq('id', personaId).single(),
    client.from('memories').select('id', { count: 'exact', head: true }).eq('persona_id', personaId),
    client.from('conversations').select('id', { count: 'exact', head: true }).eq('persona_id', personaId)
  ]);

  if (persona.error) {
    throw new Error(`Failed to fetch persona: ${persona.error.message}`);
  }

  return {
    ...persona.data,
    memory_count: memoryCount.count || 0,
    conversation_count: conversationCount.count || 0
  };
}

/**
 * Get conversation with messages (respects RLS)
 */
export async function getConversationWithMessages(
  client: SupabaseClient<Database>,
  conversationId: string
) {
  const { data, error } = await client
    .from('conversations')
    .select(`
      *,
      persona:personas(*),
      messages:messages(*)
    `)
    .eq('id', conversationId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch conversation: ${error.message}`);
  }

  return data;
}

/**
 * Get flagged messages for admin review
 * Note: Requires admin role in JWT
 */
export async function getFlaggedMessages(
  client: SupabaseClient<Database>,
  options: {
    crisis_level?: 'low' | 'medium' | 'high';
    review_status?: 'pending' | 'reviewed' | 'escalated' | 'resolved';
    limit?: number;
    offset?: number;
  } = {}
) {
  let query = client
    .from('messages')
    .select(`
      *,
      conversation:conversations(
        id,
        title,
        persona:personas(id, name)
      )
    `)
    .eq('flagged_for_review', true)
    .order('created_at', { ascending: false });

  if (options.crisis_level) {
    query = query.eq('crisis_level', options.crisis_level);
  }

  if (options.review_status) {
    query = query.eq('review_status', options.review_status);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch flagged messages: ${error.message}`);
  }

  return { messages: data, total_count: count || 0 };
}

// =====================================================
// CRISIS DETECTION HELPERS
// =====================================================

/**
 * Update message crisis review status
 */
export async function updateCrisisReview(
  client: SupabaseClient<Database>,
  messageId: string,
  updates: {
    review_status: 'reviewed' | 'escalated' | 'resolved';
    review_notes?: string;
  }
) {
  const { data: session } = await client.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User must be authenticated');
  }

  const { data, error } = await client
    .from('messages')
    .update({
      ...updates,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update crisis review: ${error.message}`);
  }

  return data;
}

/**
 * Get crisis statistics for dashboard
 */
export async function getCrisisStatistics(
  client: SupabaseClient<Database>,
  timeRange: '24h' | '7d' | '30d' | 'all' = '7d'
) {
  let startDate: string | undefined;

  if (timeRange !== 'all') {
    const now = new Date();
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    startDate = new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  }

  const queries = [
    // Total flagged
    client
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('flagged_for_review', true)
      .gte('created_at', startDate || '1970-01-01'),

    // By crisis level
    client
      .from('messages')
      .select('crisis_level')
      .eq('flagged_for_review', true)
      .gte('created_at', startDate || '1970-01-01'),

    // By review status
    client
      .from('messages')
      .select('review_status')
      .eq('flagged_for_review', true)
      .gte('created_at', startDate || '1970-01-01')
  ];

  const [totalResult, levelResult, statusResult] = await Promise.all(queries);

  // Count by level
  const byLevel = {
    low: 0,
    medium: 0,
    high: 0
  };

  if (levelResult.data) {
    levelResult.data.forEach(msg => {
      if (msg.crisis_level) {
        byLevel[msg.crisis_level]++;
      }
    });
  }

  // Count by status
  const byStatus = {
    pending: 0,
    reviewed: 0,
    escalated: 0,
    resolved: 0
  };

  if (statusResult.data) {
    statusResult.data.forEach(msg => {
      if (msg.review_status) {
        byStatus[msg.review_status as keyof typeof byStatus]++;
      }
    });
  }

  return {
    total_flagged: totalResult.count || 0,
    by_level: byLevel,
    by_status: byStatus,
    time_range: timeRange
  };
}

// =====================================================
// MEMORY MANAGEMENT HELPERS
// =====================================================

/**
 * Get memories for persona sorted by salience
 */
export async function getTopMemories(
  client: SupabaseClient<Database>,
  personaId: string,
  limit: number = 50
) {
  const { data, error } = await client
    .from('memories')
    .select('*')
    .eq('persona_id', personaId)
    .order('salience', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch memories: ${error.message}`);
  }

  return data;
}

/**
 * Search memories by tags
 */
export async function searchMemoriesByTags(
  client: SupabaseClient<Database>,
  personaId: string,
  tags: string[]
) {
  const { data, error } = await client
    .from('memories')
    .select('*')
    .eq('persona_id', personaId)
    .overlaps('tags', tags)
    .order('salience', { ascending: false });

  if (error) {
    throw new Error(`Failed to search memories: ${error.message}`);
  }

  return data;
}

/**
 * Increment memory usage count and update last_used_at
 */
export async function recordMemoryUsage(
  client: SupabaseClient<Database>,
  memoryId: string
) {
  const { data, error } = await client
    .from('memories')
    .select('usage_count')
    .eq('id', memoryId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch memory: ${error.message}`);
  }

  const { error: updateError } = await client
    .from('memories')
    .update({
      usage_count: (data.usage_count || 0) + 1,
      last_used_at: new Date().toISOString()
    })
    .eq('id', memoryId);

  if (updateError) {
    throw new Error(`Failed to update memory usage: ${updateError.message}`);
  }
}

// =====================================================
// USER SETTINGS HELPERS
// =====================================================

/**
 * Get or create user settings (with RLS)
 */
export async function getOrCreateUserSettings(
  client: SupabaseClient<Database>,
  userId: string
) {
  // Try to get existing settings
  const { data: existing, error: fetchError } = await client
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    return existing;
  }

  // Create default settings if none exist
  if (fetchError && fetchError.code === 'PGRST116') {
    const { data: created, error: createError } = await client
      .from('user_settings')
      .insert({ user_id: userId })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create user settings: ${createError.message}`);
    }

    return created;
  }

  throw new Error(`Failed to fetch user settings: ${fetchError.message}`);
}

// =====================================================
// BATCH OPERATIONS
// =====================================================

/**
 * Batch insert memories (efficient for large imports)
 */
export async function batchInsertMemories(
  client: SupabaseClient<Database>,
  memories: Array<Database['public']['Tables']['memories']['Insert']>
) {
  // Split into chunks of 100 to avoid hitting API limits
  const chunkSize = 100;
  const results = [];

  for (let i = 0; i < memories.length; i += chunkSize) {
    const chunk = memories.slice(i, i + chunkSize);
    const { data, error } = await client
      .from('memories')
      .insert(chunk)
      .select();

    if (error) {
      throw new Error(`Failed to insert memory batch: ${error.message}`);
    }

    results.push(...(data || []));
  }

  return results;
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validate that user can access a conversation
 */
export async function validateConversationAccess(
  client: SupabaseClient<Database>,
  conversationId: string
): Promise<boolean> {
  const { data, error } = await client
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Validate that user can access a persona
 */
export async function validatePersonaAccess(
  client: SupabaseClient<Database>,
  personaId: string
): Promise<boolean> {
  const { data, error } = await client
    .from('personas')
    .select('id')
    .eq('id', personaId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

// =====================================================
// EXPORT ALL HELPERS
// =====================================================

export const supabaseHelpers = {
  // Client factories
  getSupabaseServiceClient,
  getSupabaseClient,

  // RLS queries
  userOwnsPersona,
  getUserPersonas,
  getPersonaWithStats,
  getConversationWithMessages,

  // Crisis detection
  getFlaggedMessages,
  updateCrisisReview,
  getCrisisStatistics,

  // Memories
  getTopMemories,
  searchMemoriesByTags,
  recordMemoryUsage,
  batchInsertMemories,

  // User settings
  getOrCreateUserSettings,

  // Validation
  validateConversationAccess,
  validatePersonaAccess
};

export default supabaseHelpers;
