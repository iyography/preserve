# Preserving Connections

A comprehensive grief-tech platform that creates AI personas of deceased loved ones, helping families preserve memories and maintain meaningful connections through advanced AI technology.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)

## Overview

Preserving Connections is a grief-tech platform that uses AI to create authentic digital personas of deceased loved ones. The platform features:

- **AI-Powered Personas**: Creates realistic conversational AI based on comprehensive personality data
- **Memory Preservation**: Stores and retrieves memories from obituaries, questionnaires, and conversations
- **Real-Time Feedback**: Instant AI preference learning with sub-200ms processing
- **Gradual Awakening**: Multi-step onboarding process that collects detailed personality information
- **Professional Waitlist System**: Email notifications and partner applications
- **Photo Management**: Upload, crop, and manage persona photos
- **Authentication**: Complete auth system with password reset capabilities
- **Mobile Responsive**: Fully optimized for all device sizes

## Features

### Core Functionality
- **AI Personas** with personality-driven conversations grounded in real data
- **Memory System** that organizes information by type (episodic, semantic, preferences, relationships)
- **Response Deduplication** with 30-minute no-repeat guarantee
- **Real-Time Preference Engine** that learns from user corrections instantly
- **Multi-Provider AI Reliability** with OpenAI and Anthropic support
- **Personality Evolution** that improves conversations over time

### Technical Features
- Full-stack TypeScript application
- PostgreSQL database with Drizzle ORM
- React + Vite frontend with shadcn/ui components
- Express.js backend with RESTful API
- TanStack Query for state management
- Framer Motion animations
- Email notifications via Resend

## Prerequisites

Before running this application locally, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager (comes with Node.js)
- **PostgreSQL** database (v14 or higher) - [Download here](https://www.postgresql.org/download/)
  - Alternatively, use a cloud PostgreSQL service like [Neon](https://neon.tech/) or [Supabase](https://supabase.com/)
- **Git** - [Download here](https://git-scm.com/downloads)

## Getting Started

### 1. Clone from Replit

If you're pulling this project from Replit, you have several options:

#### Option A: Download as ZIP
1. In your Replit workspace, click the three dots menu (⋯)
2. Select "Download as ZIP"
3. Extract the ZIP file to your local machine

#### Option B: Use Git (Recommended)
1. In Replit, go to the "Version Control" tab
2. Connect your GitHub account if not already connected
3. Push your Replit project to GitHub
4. Clone the GitHub repository to your local machine:
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

#### Option C: SSH from Replit
1. Set up SSH keys on your local machine
2. Add your public key to Replit account settings
3. Use an SSH-enabled editor (VSCode, Cursor) to connect directly

### 2. Install Dependencies

Navigate to the project directory and install all required packages:

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following environment variables (see [Environment Variables](#environment-variables) section for details):

```env
# Database (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/preserving_connections"

# PostgreSQL Connection Details (auto-populated if using DATABASE_URL)
PGHOST="localhost"
PGUSER="your_username"
PGPASSWORD="your_password"
PGDATABASE="preserving_connections"
PGPORT="5432"

# AI Provider API Keys (at least one required)
OPENAI_API_KEY="your_openai_api_key_here"
ANTHROPIC_API_KEY="your_anthropic_api_key_here"

# Supabase (Required for authentication)
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Email Service (Optional - for email notifications)
RESEND_API_KEY="your_resend_api_key"
ADMIN_EMAIL="admin@yourdomain.com"

# Web Scraping (Optional - for obituary parsing)
SCRAPINGBEE_API_KEY="your_scrapingbee_api_key"

# Object Storage (Optional - for file uploads)
DEFAULT_OBJECT_STORAGE_BUCKET_ID="your_bucket_id"
PUBLIC_OBJECT_SEARCH_PATHS="public"
PRIVATE_OBJECT_DIR=".private"
```

## Environment Variables

### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `DATABASE_URL` | PostgreSQL connection string | Your PostgreSQL database or cloud provider (Neon, Supabase) |
| `VITE_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://app.supabase.com/) → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | [Supabase Dashboard](https://app.supabase.com/) → Settings → API |
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | AI provider API key | [OpenAI](https://platform.openai.com/api-keys) or [Anthropic](https://console.anthropic.com/) |

### Optional Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `RESEND_API_KEY` | Email service API key | [Resend Dashboard](https://resend.com/api-keys) |
| `ADMIN_EMAIL` | Email for admin notifications | Your email address for receiving partner/waitlist notifications |
| `SCRAPINGBEE_API_KEY` | Web scraping service | [ScrapingBee](https://www.scrapingbee.com/) |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | Cloud storage bucket ID | Google Cloud Storage or AWS S3 |

### Getting API Keys

#### Supabase (Required)
1. Go to [Supabase](https://app.supabase.com/)
2. Create a new project or use an existing one
3. Go to Settings → API
4. Copy the **Project URL** and **anon/public key**

#### OpenAI (Recommended)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and add billing
3. Go to API Keys section
4. Create a new secret key

#### Anthropic (Alternative to OpenAI)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account
3. Generate an API key

#### Resend (Optional - for emails)
1. Go to [Resend](https://resend.com/)
2. Create an account
3. Generate an API key
4. Verify your domain for production use

## Running the Application

### Development Mode

Start the development server (runs both frontend and backend):

```bash
npm run dev
```

The application will be available at:
- **Frontend & Backend**: http://localhost:5000

The dev server includes:
- Hot module replacement (HMR) for instant updates
- TypeScript compilation
- Automatic server restart on changes

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Type Checking

Run TypeScript type checking:

```bash
npm run check
```

## Database Setup

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** on your machine

2. **Create a database**:
```bash
createdb preserving_connections
```

3. **Update DATABASE_URL** in `.env`:
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/preserving_connections"
```

4. **Push database schema**:
```bash
npm run db:push
```

### Option 2: Cloud PostgreSQL (Recommended)

#### Using Neon (Serverless PostgreSQL)
1. Go to [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string
4. Add to `.env` as `DATABASE_URL`
5. Run `npm run db:push`

#### Using Supabase Database
1. Go to your Supabase project
2. Navigate to Settings → Database
3. Copy the connection string (use "Connection pooling" for better performance)
4. Add to `.env` as `DATABASE_URL`
5. Run `npm run db:push`

### Database Migrations

The project uses Drizzle ORM. To push schema changes to the database:

```bash
npm run db:push
```

## Project Structure

```
preserving-connections/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and configs
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   ├── services/          # Business logic services
│   └── middleware/        # Express middleware
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema (Drizzle)
├── migrations/            # Database migrations
├── public/                # Static assets
└── .env                   # Environment variables (create this)
```

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Supabase** - Authentication
- **OpenAI / Anthropic** - AI providers
- **Resend** - Email service

### Development Tools
- **tsx** - TypeScript execution
- **esbuild** - Fast bundling
- **Drizzle Kit** - Database migrations

## Troubleshooting

### Common Issues

**Port 5000 already in use:**
```bash
# Find and kill the process using port 5000
lsof -ti:5000 | xargs kill -9
```

**Database connection errors:**
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format is correct
- Ensure database exists: `psql -l`

**TypeScript errors:**
- Run type checking: `npm run check`
- Ensure all dependencies are installed: `npm install`

**Missing environment variables:**
- Verify `.env` file exists in root directory
- Check all required variables are set
- Restart dev server after adding variables

**Supabase authentication issues:**
- Verify Supabase project is active
- Check API keys are correct
- Ensure Supabase authentication is enabled in dashboard

## Development Workflow

1. **Make changes** to the codebase
2. **Auto-reload** sees changes immediately in browser
3. **Check types** with `npm run check` before committing
4. **Push database changes** with `npm run db:push` if schema updated
5. **Test locally** thoroughly before deploying

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review environment variable setup
- Ensure all prerequisites are installed
- Verify database is accessible

## License

MIT
