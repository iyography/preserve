# API Documentation
**Preserving Connections - Apple/Microsoft-Grade REST API**

Version: 2.0.0
Last Updated: 2025-01-17
Status: ✅ Production-Ready Core + 🚧 Enhanced Features In Progress

---

## Overview

This document provides comprehensive documentation for the Preserving Connections REST API. The API follows industry best practices with:

- **Authentication**: Supabase JWT-based authentication
- **Security**: Row Level Security (RLS) for data isolation
- **Standards**: RESTful design with standardized responses
- **Validation**: Input validation via Zod schemas
- **Error Handling**: Comprehensive error responses
- **Logging**: Structured logging for debugging and monitoring
- **Scalability**: Designed for 15,000+ concurrent users

---

## Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Pagination](#pagination)
6. [API Endpoints](#api-endpoints)
   - [Personas](#personas-api)
   - [Enhancement Progress](#enhancement-progress-api)
   - [Conversations](#conversations-api)
   - [Messages](#messages-api)
   - [Memories](#memories-api)
   - [Media](#media-api)
   - [User Settings](#user-settings-api)
7. [Code Examples](#code-examples)

---

## Base URL

**Development**: `http://localhost:3000/api`
**Production**: `https://your-domain.com/api`

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <SUPABASE_JWT_TOKEN>
```

### Getting a Token

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Use data.session.access_token as your Bearer token
const token = data.session?.access_token;
```

### Protected Endpoints

All endpoints under `/api/*` (except public endpoints like `/api/health`) require authentication via the `verifyJWT` middleware.

---

## Response Format

### Success Response

```typescript
{
  "success": true,
  "data": <response_data>,
  "meta": {
    "pagination": { // Optional
      "page": 1,
      "pageSize": 20,
      "totalItems": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "timestamp": "2025-01-17T12:00:00.000Z"
}
```

### Error Response

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "name",
      "message": "Name is required"
    }
  },
  "timestamp": "2025-01-17T12:00:00.000Z"
}
```

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful deletion) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication token |
| `FORBIDDEN` | User doesn't have access to the resource |
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `PERSONA_NOT_FOUND` | Specific persona not found |
| `CONVERSATION_NOT_FOUND` | Specific conversation not found |
| `ALREADY_EXISTS` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

---

## Pagination

Paginated endpoints support the following query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `pageSize` | number | 20 | Items per page (max 100) |
| `sortBy` | string | varies | Field to sort by |
| `sortOrder` | string | `desc` | Sort order (`asc` or `desc`) |

### Example

```http
GET /api/conversations/:id/messages/paginated?page=2&pageSize=50&sortOrder=asc
```

---

## API Endpoints

### Health Check

#### `GET /api/health`

Check API health status.

**Authentication**: None required

**Response**:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "uptime": 86400,
  "timestamp": "2025-01-17T12:00:00.000Z"
}
```

---

## Personas API

### List Personas

#### `GET /api/personas`

Get all personas for the authenticated user.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "John Doe",
      "relationship": "Father",
      "onboardingApproach": "ai-guided-interview",
      "onboardingData": {},
      "status": "completed",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T00:00:00.000Z"
    }
  ]
}
```

### Get Persona with Progress

#### `GET /api/personas/:id/with-progress`

Get a persona with complete enhancement progress and statistics.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "relationship": "Father",
    "enhancementProgress": {
      "setup": {
        "completed": true,
        "completionPercentage": 100,
        "lastUpdated": "2025-01-15T00:00:00.000Z"
      },
      "memories": {
        "completed": true,
        "completionPercentage": 100,
        "lastUpdated": "2025-01-16T00:00:00.000Z"
      },
      "legacy": {
        "completed": false,
        "completionPercentage": 50,
        "lastUpdated": "2025-01-10T00:00:00.000Z"
      },
      "survey": {
        "completed": true,
        "completionPercentage": 100,
        "lastUpdated": "2025-01-14T00:00:00.000Z"
      },
      "overallCompletion": 88
    },
    "memoryCount": 45,
    "conversationCount": 12,
    "totalMessages": 247
  }
}
```

### Create Persona

#### `POST /api/personas`

Create a new persona.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "John Doe",
  "relationship": "Father",
  "onboardingApproach": "ai-guided-interview",
  "onboardingData": {
    "dateOfBirth": "1950-01-01",
    "interests": ["Golf", "Reading"]
  },
  "status": "in_progress"
}
```

**Response**: `201 Created`

### Update Persona

#### `PUT /api/personas/:id`

Update an existing persona.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Updated Name",
  "status": "completed"
}
```

**Response**: `200 OK`

### Delete Persona

#### `DELETE /api/personas/:id`

Delete a persona and all related data.

**Authentication**: Required

**Response**: `204 No Content`

---

## Enhancement Progress API

### Get Enhancement Progress

#### `GET /api/personas/:id/enhancement-progress`

Get complete enhancement progress for all four sections.

**Authentication**: Required

**Sections**:
- **Setup**: Basic persona information
- **Memories**: Added memories
- **Legacy**: Legacy.com obituary data
- **Survey**: Advanced questionnaire completion

**Response**:
```json
{
  "success": true,
  "data": {
    "setup": {
      "completed": true,
      "completionPercentage": 100,
      "lastUpdated": "2025-01-15T00:00:00.000Z",
      "data": {
        "hasName": true,
        "hasRelationship": true,
        "hasOnboardingData": true
      }
    },
    "memories": {
      "completed": true,
      "completionPercentage": 100,
      "lastUpdated": "2025-01-16T00:00:00.000Z",
      "data": {
        "memoryCount": 45
      }
    },
    "legacy": {
      "completed": false,
      "completionPercentage": 50,
      "lastUpdated": "2025-01-10T00:00:00.000Z",
      "data": {
        "hasObituary": true,
        "legacyMemoryCount": 5
      }
    },
    "survey": {
      "completed": true,
      "completionPercentage": 100,
      "lastUpdated": "2025-01-14T00:00:00.000Z",
      "data": {
        "currentStep": 10,
        "isCompleted": true
      }
    },
    "overallCompletion": 88,
    "lastUpdated": "2025-01-17T12:00:00.000Z"
  }
}
```

### Update Enhancement Progress

#### `PUT /api/personas/:id/enhancement-progress`

Update progress for a specific section.

**Authentication**: Required

**Request Body**:
```json
{
  "section": "legacy",
  "data": {
    "obituaryUrl": "https://legacy.com/...",
    "obituaryData": {}
  }
}
```

**Response**: `200 OK` with updated progress

---

## Conversations API

### List Conversations

#### `GET /api/conversations`

Get all conversations for the authenticated user.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "personaId": "uuid",
      "title": "Chat with Dad",
      "startedAt": "2025-01-15T10:00:00.000Z",
      "lastMessageAt": "2025-01-17T12:00:00.000Z",
      "status": "active",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Full Conversation

#### `GET /api/conversations/:id/full`

Get complete conversation with messages and persona details.

**Authentication**: Required

**Query Parameters**: Supports pagination

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Chat with Dad",
    "persona": {
      "id": "uuid",
      "name": "John Doe",
      "relationship": "Father"
    },
    "messages": [...],
    "messagesPagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 50,
      "totalPages": 3
    }
  }
}
```

### Create Conversation

#### `POST /api/conversations`

Create a new conversation.

**Authentication**: Required

**Request Body**:
```json
{
  "personaId": "uuid",
  "title": "Evening Chat"
}
```

**Response**: `201 Created`

---

## Messages API

### Get Messages (Paginated)

#### `GET /api/conversations/:id/messages/paginated`

Get messages for a conversation with pagination.

**Authentication**: Required

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20, max: 100)
- `sortOrder` (string, default: 'asc')

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "conversationId": "uuid",
        "role": "user",
        "content": "How are you doing?",
        "createdAt": "2025-01-17T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 50,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Send Message

#### `POST /api/messages`

Send a new message and get AI response.

**Authentication**: Required

**Request Body**:
```json
{
  "conversationId": "uuid",
  "content": "Hello!"
}
```

**Response**: `201 Created`

---

## Memories API

### List Memories

#### `GET /api/memories`

Get all memories for a persona or user.

**Authentication**: Required

**Query Parameters**:
- `personaId` (string, optional)
- `limit` (number, optional)
- `tags` (string, comma-separated, optional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "personaId": "uuid",
      "type": "episodic",
      "content": "Loved playing golf on weekends",
      "source": "questionnaire",
      "salience": 0.95,
      "tags": ["hobbies", "golf"],
      "createdAt": "2025-01-10T00:00:00.000Z"
    }
  ]
}
```

### Create Memory

#### `POST /api/memories`

Add a new memory.

**Authentication**: Required

**Request Body**:
```json
{
  "personaId": "uuid",
  "type": "episodic",
  "content": "Loved fishing at the lake",
  "source": "user_input",
  "salience": 0.9,
  "tags": ["hobbies", "fishing"]
}
```

**Response**: `201 Created`

### Update Memory

#### `PUT /api/memories/:id`

Update an existing memory.

**Authentication**: Required

**Request Body**:
```json
{
  "salience": 0.95,
  "tags": ["hobbies", "fishing", "outdoors"]
}
```

**Response**: `200 OK`

### Delete Memory

#### `DELETE /api/memories/:id`

Delete a memory.

**Authentication**: Required

**Response**: `204 No Content`

---

## Media API

### Upload Media

#### `POST /api/personas/:personaId/media`

Upload photo, video, or audio for a persona.

**Authentication**: Required

**Request**: `multipart/form-data`

**Fields**:
- `file`: The media file (max 10MB)

**Supported Types**:
- Images: JPEG, PNG, GIF, WEBP
- Audio: MP3, WAV
- Video: MP4, MOV, AVI

**Response**: `201 Created`

### List Media

#### `GET /api/personas/:personaId/media`

Get all media for a persona.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "personaId": "uuid",
      "filename": "photo_123.jpg",
      "url": "https://storage.../photo_123.jpg",
      "mediaType": "photo",
      "size": 2048576,
      "createdAt": "2025-01-10T00:00:00.000Z"
    }
  ]
}
```

### Delete Media

#### `DELETE /api/personas/:personaId/media/:mediaId`

Delete a media file.

**Authentication**: Required

**Response**: `204 No Content`

---

## User Settings API

### Get Settings

#### `GET /api/user/settings`

Get user settings.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "displayName": "John Smith",
    "theme": "dark",
    "emailNotifications": true,
    "preferredLanguage": "en",
    ...
  }
}
```

### Update Settings

#### `PUT /api/user/settings`

Update user settings.

**Authentication**: Required

**Request Body**:
```json
{
  "theme": "light",
  "emailNotifications": false
}
```

**Response**: `200 OK`

---

## Code Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in
const { data: authData } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

const token = authData.session?.access_token;

// Make API request
const response = await fetch('http://localhost:3000/api/personas', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const result = await response.json();

if (result.success) {
  console.log('Personas:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### Create Persona with Progress Tracking

```typescript
// Create persona
const createResponse = await fetch('http://localhost:3000/api/personas', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Jane Doe',
    relationship: 'Mother',
    onboardingApproach: 'questionnaire',
    status: 'in_progress',
  }),
});

const persona = await createResponse.json();
const personaId = persona.data.id;

// Check progress
const progressResponse = await fetch(
  `http://localhost:3000/api/personas/${personaId}/enhancement-progress`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const progress = await progressResponse.json();
console.log('Overall completion:', progress.data.overallCompletion);
```

### Paginated Messages

```typescript
// Get first page of messages
const page = 1;
const pageSize = 20;

const response = await fetch(
  `http://localhost:3000/api/conversations/${conversationId}/messages/paginated?page=${page}&pageSize=${pageSize}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const result = await response.json();

console.log('Messages:', result.data.items);
console.log('Total pages:', result.data.pagination.totalPages);
console.log('Has next page:', result.data.pagination.hasNextPage);
```

---

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Free tier**: 100 requests per minute
- **Authenticated**: 1000 requests per minute

When rate limited, you'll receive a `429 Too Many Requests` response with:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

---

## Webhook Support

Coming soon: Webhook notifications for events like:
- New messages
- Conversation updates
- Persona creation/updates

---

## Support

For API issues or questions:
- **Documentation**: https://docs.preservingconnections.com
- **GitHub**: https://github.com/preserving-connections
- **Email**: support@preservingconnections.com

---

**Last Updated**: 2025-01-17
**API Version**: 2.0.0
**Status**: ✅ Production-Ready Core Infrastructure + 🚧 Enhanced Features
