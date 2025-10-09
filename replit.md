# Overview

This is a grief-tech platform called "Preserving Connections" that creates AI personas of deceased loved ones using comprehensive personality data and authentic conversation patterns. The application features a modern, celestial-themed UI with interactive elements like particle systems and audio players. It's built using a client-server architecture with Express.js on the backend and React with Vite on the frontend.

## Recent Updates (Oct 9, 2025)

### Critical Memory Retrieval Fix
- **Fixed**: PersonaPromptBuilder now retrieves memories from database
- **Impact**: AI personas now have access to obituary data, questionnaire responses, and conversation history
- **Implementation**: Added `fetchRelevantMemories()` method that pulls up to 50 memories organized by type
- **Memory types**: episodic, semantic, preference, relationship, legacy_import, questionnaire, boundary

### Documentation & Local Development
- **Updated README.md**: Comprehensive setup guide for running locally
- **Created .env.example**: Template for environment variables
- **Security**: Removed hardcoded admin email, now uses `ADMIN_EMAIL` env variable
- **Instructions**: Full walkthrough for cloning from Replit and running on local machine

## Grief-Tech Features

### Response Deduplication System
- **30-minute no-repeat guarantee**: Comprehensive tracking system prevents any quote or response from being reused within 30 minutes
- **Persona scoping**: Deduplication is scoped per persona to prevent cross-persona interference
- **Persistent tracking**: Uses localStorage to maintain deduplication state across page reloads and browser sessions
- **Race condition protection**: Ensures deduplication state loads before any response selection
- **Multi-layered coverage**: Covers welcome messages, fallback responses, AI-generated responses, and emergency fallbacks
- **Authentic alternatives**: When response pools are exhausted, system synthesizes variants using actual personality data

### Golden Rules for Authentic Conversation
- **No corny quotes**: System explicitly prevents generic phrases like "memories are a treasure" or "sunshine of the soul"
- **Grounded in data**: All responses must be traceable to onboarding input or user-supplied facts
- **Familiar tone**: Conversations feel like chatting with a friend, not formal or essay-like
- **Responsible memory use**: References specific details and behaviors rather than abstract concepts
- **Strong guardrails**: Admits uncertainty honestly, handles sensitive topics with care, avoids platitudes
- **Natural flow**: Uses short, human sentences with varied structures and specific details

### AI Persona Framework
- **Human-like preservation**: Maintains consistent personality traits, communication styles, and relationship dynamics
- **Onboarding-driven**: Uses comprehensive personality data from user input to create authentic responses
- **Context-aware**: References specific memories, habits, and communication patterns from the deceased person
- **Emotional authenticity**: Matches actual support styles and celebration patterns rather than generic responses

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **UI Framework**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation through @hookform/resolvers
- **Animations**: Framer Motion for advanced animations and transitions

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **API Design**: RESTful API with routes prefixed under `/api`
- **Session Management**: PostgreSQL session store using connect-pg-simple
- **Development**: Hot reload setup with tsx and Vite integration

## Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: Shared schema definition in `shared/schema.ts`
- **Current Tables**: Users table with id (UUID), username (unique), and password fields
- **Migrations**: Managed through Drizzle Kit with migrations stored in `./migrations`

## Development Setup
- **Monorepo Structure**: Client and server code in separate directories with shared types
- **Build Process**: Vite for frontend bundling, esbuild for server compilation
- **TypeScript Configuration**: Strict mode enabled with path mapping for clean imports
- **Hot Reload**: Development server with automatic restart and error overlay

## Storage Architecture
- **Interface-Based Design**: IStorage interface for CRUD operations
- **Current Implementation**: In-memory storage (MemStorage) for development
- **Database Integration**: Ready for PostgreSQL integration via Drizzle ORM
- **Scalability**: Designed to easily swap storage implementations

## UI Component System
- **Design System**: shadcn/ui with "new-york" style variant
- **Theme**: Custom celestial color palette with CSS variables
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: Built on Radix UI primitives for WCAG compliance

# External Dependencies

## Database
- **PostgreSQL**: Primary database using Neon serverless for cloud hosting
- **Connection**: Environment variable `DATABASE_URL` required for database connectivity

## UI Libraries
- **Radix UI**: Comprehensive collection of unstyled, accessible UI primitives
- **Framer Motion**: Animation library for complex UI transitions
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel/slider functionality

## Development Tools
- **Vite**: Fast build tool with HMR and plugin ecosystem
- **Replit Integration**: Custom plugins for Replit development environment
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Validation & Forms
- **Zod**: TypeScript-first schema validation
- **React Hook Form**: Performant forms with minimal re-renders
- **Drizzle Zod**: Integration between Drizzle ORM and Zod schemas

## Utilities
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx & tailwind-merge**: Conditional CSS class name utilities
- **date-fns**: Modern date utility library