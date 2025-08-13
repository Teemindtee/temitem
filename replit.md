# Overview

FinderMeister is a full-stack service marketplace platform that connects clients who need help finding products or services with freelance "finders" who can assist them. The application features role-based authentication (clients, finders, and admins), a token-based proposal system, escrow functionality, and comprehensive admin management capabilities.

## Recent Updates - Mobile Client Interface ✅ COMPLETED

**Implemented mobile-first client landing and dashboard matching design mockup**:
- **Mobile Landing Page**: Clean design with FinderMeister logo, centered messaging, and prominent CTA button
- **Client Mobile Dashboard**: Grid layout with user profile header showing first name and avatar
- **Dashboard Actions**: Four main action cards - Post Request, View Proposals, My Contracts, Settings
- **Responsive Design**: Automatic mobile detection switches to mobile-optimized layout
- **Visual Consistency**: Red theme matching brand colors with proper spacing and shadows
- **Navigation Integration**: All action cards link to existing client functionality
- **Mobile Routes**: Added /mobile and /client/mobile-dashboard routes for dedicated mobile access

## Previous Updates - Profile Management System ✅ COMPLETED

**Recreated finder profile page as clean editable form**:
- **Always Editable Form**: All profile fields immediately available for editing without mode switching
- **Single Update Action**: One "Update Profile" button at bottom for clear user experience
- **Clean Interface**: Simplified layout with profile stats at top and form fields below
- **Responsive Design**: Mobile-friendly layout with proper field spacing
- **Data Integration**: Form loads current data and saves changes correctly to backend
- **Field Management**: Name field read-only (admin changes), all other fields fully editable
- **User Feedback**: Clear success/error messages and loading states during updates

## Previous Updates - Admin Management System ✅ COMPLETED

**Complete admin platform** with full backend API and frontend UI implementation:
- **User Management**: Ban/unban users with reason tracking, verify/unverify functionality  
- **Category Management**: Create, edit, delete request categories (tested: "Web Development" category created)
- **Platform Settings**: Configure proposal token costs (tested: successfully updated 1→2 tokens)
- **Withdrawal Processing**: Handle finder withdrawal requests with admin approval workflow
- **Request Monitoring**: Comprehensive view and management of all platform requests
- **Admin Dashboard**: Unified control panel with metrics and quick actions
- **Admin Access**: admin@findermeister.com / admin123 | Routes: /admin/* 

All admin APIs tested and working correctly. Frontend forms properly save data to backend.

# User Preferences

Preferred communication style: Simple, everyday language.
Design requirements: Clean, simple UI matching exact mockups without complex filters or excessive features.
User feedback: Frustrated with back-and-forth iterations - requires working solutions on first attempt.

# System Architecture

## Frontend Architecture
- **React SPA**: Built with React 18 using TypeScript for type safety
- **Routing**: Client-side routing implemented with Wouter for lightweight navigation
- **State Management**: TanStack Query for server state management and React hooks for local state
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Authentication**: JWT-based authentication with protected routes and role-based access control
- **Responsive Design**: Mobile-first approach with dedicated mobile navigation component

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Design**: RESTful API structure with middleware for authentication and error handling
- **Development Setup**: Vite for development server with hot module replacement

## Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle migrations for version control
- **Key Entities**:
  - Users (clients, finders, admins) with role-based permissions
  - Finders with profile metrics (jobs completed, earnings, ratings)
  - Requests from clients with budget ranges and status tracking
  - Proposals from finders with token-based submission system
  - Contracts and escrow for payment management
  - Token system for finder proposal submissions
  - Reviews and ratings for completed work

## Authentication & Authorization
- **JWT Implementation**: Stateless authentication with secure token storage
- **Role-Based Access**: Three distinct user roles with different permissions
- **Protected Routes**: Client-side route protection based on authentication status
- **Password Security**: Bcrypt hashing with salt rounds for secure password storage

## Token Economy System
- **Proposal Tokens**: Finders must spend tokens to submit proposals
- **Payment Integration**: Ready for Paystack integration for token purchases
- **Escrow System**: Secure payment holding until work completion and approval

## Request Status Flow
- **Open**: Request is available for proposals (default status)
- **In Progress**: Request has an accepted proposal and work is underway
- **Completed**: Request work has been finished and approved
- **Cancelled**: Request was cancelled by client

## Messaging System
- **Client-Initiated**: Only clients can initiate conversations with finders
- **Proposal-Based**: Conversations are tied to specific proposals
- **Universal Access**: Clients can message any finder who submitted a proposal (regardless of acceptance status)
- **Comment-Like Proposals**: Finders only see their own proposals per request; clients see all proposals

## Development & Deployment
- **Build System**: Vite for frontend bundling and esbuild for backend compilation
- **TypeScript**: Full TypeScript implementation across frontend, backend, and shared schemas
- **Environment Configuration**: Separate development and production configurations
- **Code Organization**: Monorepo structure with shared types and schemas

# External Dependencies

## Database & Storage
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management

## UI & Styling
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Shadcn/ui**: Pre-built component library built on Radix primitives

## Authentication & Security
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcrypt**: Password hashing and validation
- **Zod**: Runtime type validation for API requests

## State Management & Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

## Payment Processing (Planned)
- **Paystack**: Payment gateway for token purchases and escrow transactions

## Routing & Navigation
- **Wouter**: Lightweight React router for client-side navigation