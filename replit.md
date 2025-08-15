# Overview

This is a full-stack React application built with TypeScript that appears to be focused on creating digital personas or connections. The application features a modern, celestial-themed UI with interactive elements like particle systems and audio players. It's built using a client-server architecture with Express.js on the backend and React with Vite on the frontend.

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