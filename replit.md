# Overview

FinderMeister is a full-stack service marketplace platform designed to connect clients seeking products or services with freelance "finders." The platform facilitates a streamlined process for clients to post requests and for finders to submit proposals. Key features include role-based authentication (clients, finders, admins), a token-based proposal system, secure escrow functionality for payments, and comprehensive administrative tools for platform management. The vision is to create an efficient and trustworthy marketplace for finding specialized services.

## Recent Enhancements (January 2025)
- **Client Profile Page**: Completely redesigned with ultra-modern, clean, crispy design featuring animated gradient backgrounds, premium glass-morphism cards, enhanced mobile responsiveness, inline editing system, and comprehensive account management features.
- **Withdrawal Balance Fix**: Resolved critical issue where negative balances (₦-2272.50) were displayed, implemented proper balance validation, and reset affected balances to zero with Math.max(0, balance) protection.
- **Logout Redirect Enhancement**: Fixed logout functionality to redirect immediately to home page without showing flash of empty data or current page content during logout process.

# User Preferences

Preferred communication style: Simple, everyday language.
Design requirements: Clean, simple UI matching exact mockups without complex filters or excessive features.
User feedback: Frustrated with back-and-forth iterations - requires working solutions on first attempt.

# System Architecture

## Frontend Architecture
- **Technology Stack**: React 18 with TypeScript.
- **Routing**: Lightweight client-side navigation using Wouter.
- **State Management**: TanStack Query for server state and React hooks for local state.
- **UI/UX**: Shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS, emphasizing a mobile-first responsive design.
- **Authentication**: JWT-based authentication with protected routes and role-based access control.

## Backend Architecture
- **Runtime & Framework**: Node.js with Express.js.
- **ORM**: Drizzle ORM for type-safe database interactions.
- **Authentication**: JWT tokens with bcrypt for password hashing.
- **API Design**: RESTful API structure with middleware for authentication and error handling.

## Database Design
- **Database**: PostgreSQL, hosted on Neon for serverless capabilities.
- **Schema Management**: Drizzle migrations for version control.
- **Core Entities**: Users (clients, finders, admins) with role-based permissions, Finders with performance metrics, Client Requests with status tracking, Finder Proposals with token requirements, Contracts and Escrow for payment, and a Token system for proposal submissions. Reviews and ratings are also supported.

## Authentication & Authorization
- **JWT Implementation**: Stateless authentication using secure token storage.
- **Role-Based Access**: Supports distinct roles: Client, Finder, and Admin, each with specific permissions.
- **Security**: Bcrypt hashing with salt rounds for robust password security.

## Token Economy System
- **Proposal Tokens**: Finders must spend tokens to submit proposals.
- **Escrow System**: Secure payment holding until work completion and client approval.

## Request Status Flow
- **Open**: Request is active and open for proposals.
- **In Progress**: A proposal has been accepted, and work is underway.
- **Completed**: Work has been finished and approved.
- **Cancelled**: Request has been withdrawn by the client.

## Messaging System
- **Initiation**: Only clients can initiate conversations with finders.
- **Context**: Conversations are linked to specific proposals.
- **Accessibility**: Clients can message any finder who has submitted a proposal for their request.

## Development & Deployment
- **Build Tools**: Vite for frontend bundling, esbuild for backend compilation.
- **Language**: Full TypeScript implementation across frontend, backend, and shared schemas.
- **Structure**: Monorepo organization for shared types and schemas.

## Database Export System
- **Comprehensive Export**: Automated scripts for SQL, CSV, and JSON formats.
- **Export Scripts**: `scripts/simple-export.mjs` for complete database exports.
- **Multiple Formats**: 
  - SQL dumps with INSERT statements for direct PostgreSQL import
  - JSON exports with metadata and structured data
  - CSV files (one per table) for spreadsheet analysis
- **Export Statistics**: Detailed reporting of table counts and record statistics.
- **Automated Timestamping**: All exports include timestamps for version tracking.

## UI/UX Decisions
- **Color Scheme**: Consistent red branding for key interactive elements.
- **Mobile Design**: Emphasis on full-screen layouts, larger touch targets, and modern chat UI (e.g., WhatsApp-style bubbles) for mobile responsiveness.
- **Admin Interface**: Comprehensive control panel with metrics and quick actions for user, category, settings, withdrawal, and request management.
- **Profile Design**: Finder profile pages are designed as always-editable forms with a single update action.

## Customer Support System
- **Help Center**: Comprehensive FAQ system with contextual help organized by categories (Getting Started, Tokens & Payments, Communication, Work Completion, Account Management).
- **Contact Support**: Ticket submission system with priority levels and response time expectations.
- **Support Widget**: Context-aware floating help widget that appears on key pages (dashboard, contracts, proposals, etc.) with relevant tips and quick access to help resources.
- **Contextual Help**: Page-specific guidance and common questions tailored to the current user workflow.
- **Response Times**: Structured by priority levels from 2-3 business days (low) to 1-2 hours (urgent).

# External Dependencies

## Database & Storage
- **Neon PostgreSQL**: Serverless PostgreSQL database.
- **Drizzle ORM**: For database interactions and schema management.

## UI & Styling
- **Radix UI**: Headless component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn/ui**: Pre-built component library.

## Authentication & Security
- **jsonwebtoken (JWT)**: For token-based authentication.
- **bcrypt**: For password hashing.
- **Zod**: For runtime type validation of API requests.

## State Management & Data Fetching
- **TanStack Query**: For server state management.
- **React Hook Form**: For form state management and validation.

## Development Tools
- **Vite**: Frontend build tool and development server.
- **TypeScript**: For static type checking.
- **ESBuild**: For fast JavaScript bundling.

## Routing & Navigation
- **Wouter**: Lightweight React router.

## Payment Processing (Planned)
- **Paystack**: Intended for token purchases and escrow transactions.