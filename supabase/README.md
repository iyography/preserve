# Supabase Setup for Preserving Connections

**Enterprise-Grade Database with Full RLS Security**

---

## Quick Start

### 1. Apply Migration

**Option A: Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Copy contents of `migrations/20250117000000_initial_schema_with_rls.sql`
5. Run the SQL

**Option B: Supabase CLI**
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migration
supabase db push
```

**Option C: Direct PostgreSQL**
```bash
# If using Neon or direct Postgres connection
psql $DATABASE_URL < supabase/migrations/20250117000000_initial_schema_with_rls.sql
```

---

## 2. Verify Installation

Run these checks in Supabase SQL Editor:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- Should return 10 tables

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- All should have rowsecurity = true

-- Check indexes
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
-- Should have 25+ indexes

-- Test RLS (replace with actual user UUID)
SET LOCAL jwt.claims.sub = 'user-uuid-here';
SELECT * FROM personas;
-- Should only show that user's personas (or empty if none)
```

---

## 3. Environment Variables

Ensure these are set in your `.env`:

```bash
# Supabase Connection
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-only!

# Database (Neon or Supabase)
DATABASE_URL=postgresql://user:pass@host:port/database
```

---

## 4. Test Database Access

Create a test file `test-db.ts`:

```typescript
import { getSupabaseClient } from './server/utils/supabase-helpers';

async function testDatabase() {
  // This will use RLS - must be authenticated
  const supabase = getSupabaseClient();

  // Should fail (no auth)
  const { data: noAuth, error: noAuthError } = await supabase
    .from('personas')
    .select('*');

  console.log('Without auth:', noAuthError?.message);
  // Expected: "JWT expired" or similar

  // Should work with auth
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'test-password'
  });

  const { data: withAuth } = await supabase
    .from('personas')
    .select('*');

  console.log('With auth:', withAuth);
  // Expected: Array of user's personas
}

testDatabase();
```

Run with:
```bash
npx tsx test-db.ts
```

---

## Database Schema Overview

### Core Tables

1. **personas** (10 columns) - Deceased loved ones
2. **persona_media** (9 columns) - Photos, videos, audio
3. **conversations** (8 columns) - Chat sessions
4. **messages** (15 columns) - Messages with crisis detection
5. **memories** (14 columns) - Multi-source memories
6. **feedback** (10 columns) - User corrections
7. **pattern_metrics** (6 columns) - AI behavior tracking
8. **user_settings** (28 columns) - User preferences
9. **onboarding_sessions** (9 columns) - Creation flow progress
10. **questionnaire_progress** (8 columns) - Questionnaire state

### Security Features

- ✅ **Row Level Security** on all tables
- ✅ **60+ RLS policies** for comprehensive protection
- ✅ **User isolation** via auth.uid()
- ✅ **Admin policies** for crisis review
- ✅ **Cascade deletes** for data cleanup

### Performance Features

- ✅ **25+ indexes** for fast queries
- ✅ **Composite indexes** for complex filters
- ✅ **GIN indexes** for array/JSONB search
- ✅ **Partial indexes** for conditional queries

---

## Migration Files

### Current Migrations

| File | Description | Status |
|------|-------------|--------|
| `20250117000000_initial_schema_with_rls.sql` | Complete schema with RLS | ✅ Ready |

### Future Migrations

To add new migrations:

1. Create new file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Write SQL changes
3. Apply with `supabase db push`

Example:
```sql
-- supabase/migrations/20250117120000_add_tags_index.sql
BEGIN;

CREATE INDEX idx_memories_content_search
  ON memories
  USING GIN(to_tsvector('english', content));

COMMIT;
```

---

## TypeScript Types

### Location

- **Database Types**: `/types/database.ts`
- **Schema Definition**: `/shared/schema.ts` (Drizzle)

### Usage Examples

**With Supabase**:
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabase = createClient<Database>(url, key);

// Fully typed
const { data } = await supabase
  .from('personas')
  .select('*')
  .single();

// data is type: Persona
```

**With Drizzle**:
```typescript
import { db } from '@/server/db';
import { personas } from '@shared/schema';
import { eq } from 'drizzle-orm';

const persona = await db
  .select()
  .from(personas)
  .where(eq(personas.id, personaId))
  .limit(1);

// persona is type: Persona[]
```

---

## Helper Functions

### Location

- **Supabase Helpers**: `/server/utils/supabase-helpers.ts`

### Available Functions

```typescript
import {
  getSupabaseClient,
  userOwnsPersona,
  getUserPersonas,
  getPersonaWithStats,
  getConversationWithMessages,
  getFlaggedMessages,
  updateCrisisReview,
  getCrisisStatistics,
  getTopMemories,
  searchMemoriesByTags,
  recordMemoryUsage,
  getOrCreateUserSettings,
  batchInsertMemories,
  validateConversationAccess,
  validatePersonaAccess
} from '@/server/utils/supabase-helpers';
```

### Example Usage

**Check persona ownership**:
```typescript
const canAccess = await userOwnsPersona(supabase, personaId);
if (!canAccess) throw new Error('Unauthorized');
```

**Get persona with stats**:
```typescript
const persona = await getPersonaWithStats(supabase, personaId);
console.log(`${persona.name} has ${persona.memory_count} memories`);
```

**Admin: Review flagged messages**:
```typescript
const { messages, total_count } = await getFlaggedMessages(supabase, {
  crisis_level: 'high',
  review_status: 'pending',
  limit: 20
});
```

---

## Row Level Security (RLS)

### How RLS Works

1. **All tables have RLS enabled**
2. **Policies define access rules** based on authenticated user
3. **`auth.uid()`** returns current user's ID from JWT
4. **Nested policies** check ownership through foreign keys

### Example Policies

**Direct Ownership** (user_id column):
```sql
CREATE POLICY "Users can view their own personas"
  ON personas FOR SELECT
  USING (auth.uid() = user_id);
```

**Nested Ownership** (via persona):
```sql
CREATE POLICY "Users can view memories for their personas"
  ON memories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = memories.persona_id
        AND personas.user_id = auth.uid()
    )
  );
```

**Admin Access** (for crisis review):
```sql
CREATE POLICY "Admins can view flagged messages"
  ON messages FOR SELECT
  USING (
    flagged_for_review = true
    AND auth.jwt() ->> 'role' = 'admin'
  );
```

### Testing RLS

**In Supabase SQL Editor**:
```sql
-- Impersonate a user
SET LOCAL jwt.claims.sub = 'user-uuid-here';

-- Try to query personas
SELECT * FROM personas;
-- Should only show this user's personas

-- Try to access another user's data
SELECT * FROM personas WHERE user_id != 'user-uuid-here';
-- Should return empty (RLS blocks it)
```

---

## Crisis Detection Integration

### Database Fields

The `messages` table includes:

- `flagged_for_review` - Boolean, true if crisis detected
- `crisis_level` - 'low' | 'medium' | 'high'
- `crisis_keywords` - Array of detected phrases
- `intervention_delivered` - True if crisis resources shown
- `review_status` - 'pending' | 'reviewed' | 'escalated' | 'resolved'
- `reviewed_by` - Admin UUID who reviewed
- `reviewed_at` - Timestamp of review
- `review_notes` - Admin notes

### Query Flagged Messages

```sql
SELECT
  m.*,
  c.title AS conversation_title,
  p.name AS persona_name
FROM messages m
INNER JOIN conversations c ON m.conversation_id = c.id
INNER JOIN personas p ON c.persona_id = p.id
WHERE m.flagged_for_review = true
  AND m.review_status = 'pending'
  AND m.crisis_level IN ('medium', 'high')
ORDER BY m.created_at DESC
LIMIT 50;
```

### Update Review Status

```typescript
await supabase
  .from('messages')
  .update({
    review_status: 'reviewed',
    reviewed_by: adminUserId,
    reviewed_at: new Date().toISOString(),
    review_notes: 'User connected with crisis counselor'
  })
  .eq('id', messageId);
```

---

## Performance Optimization

### Query Best Practices

**✅ Do**:
- Use indexes for WHERE, JOIN, ORDER BY
- Limit results to needed rows
- Select specific columns (not SELECT *)
- Use pagination for large datasets
- Join tables instead of multiple queries

**❌ Don't**:
- N+1 queries (query in loops)
- SELECT * in production
- Missing indexes on filtered columns
- Unbounded queries without LIMIT

### Monitoring

**Check slow queries** (Supabase Dashboard):
- Go to Database → Query Performance
- Look for queries > 100ms
- Add indexes for frequently filtered columns

**EXPLAIN ANALYZE**:
```sql
EXPLAIN ANALYZE
SELECT *
FROM messages
WHERE conversation_id = 'uuid-here'
ORDER BY created_at DESC
LIMIT 50;
```

---

## Troubleshooting

### Common Issues

**Issue**: "JWT expired" or "permission denied"
**Fix**: Ensure user is authenticated with valid session

**Issue**: "relation does not exist"
**Fix**: Migration not applied. Run `supabase db push`

**Issue**: "violates foreign key constraint"
**Fix**: Referenced record doesn't exist. Check parent table.

**Issue**: "duplicate key value violates unique constraint"
**Fix**: Record with that key already exists. Use upsert or check first.

**Issue**: "policy violated"
**Fix**: RLS policy denying access. Check `auth.uid()` matches owner.

### Debug RLS Policies

**See active policies**:
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Disable RLS temporarily** (DEVELOPMENT ONLY):
```sql
ALTER TABLE personas DISABLE ROW LEVEL SECURITY;
```

---

## Documentation

- **Full Architecture**: `/docs/DATABASE_ARCHITECTURE.md`
- **Safety System**: `/docs/SAFETY_SYSTEM.md`
- **Code Review**: `/CODE_REVIEW_SUMMARY.md`

---

## Support

**Issues**: https://github.com/anthropics/claude-code/issues
**Supabase Docs**: https://supabase.com/docs
**PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Setup Version**: 1.0.0
**Last Updated**: 2025-01-17
**Status**: ✅ Production Ready
