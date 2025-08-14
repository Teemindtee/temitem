# Overview

FinderMeister is a full-stack service marketplace platform that connects clients who need help finding products or services with freelance "finders" who can assist them. The application features role-based authentication (clients, finders, and admins), a token-based proposal system, escrow functionality, and comprehensive admin management capabilities.

## Latest Update - Messaging System Fix ✅ COMPLETED

**Fixed messaging system authentication and message sending**:
- **Conversation Creation**: Successfully fixed "Message Finder" button - now creates conversations properly
- **Message Sending**: Fixed authentication token issue preventing messages from being sent
- **API Integration**: Updated ConversationDetail to use apiRequest helper with correct token handling
- **Mobile Dashboard**: Replaced "Messages" with "Contracts" button as requested
- **Contracts Page**: Created new client contracts page with proper routing and UI
- **Error Handling**: Improved error message parsing and debugging capabilities
- **Authentication**: Fixed localStorage token key from 'token' to 'findermeister_token'

**Previous Fixes Completed**:
- **API Error Resolution**: Replaced direct fetch calls with apiRequest helper for proper error handling
- **Form Data Validation**: Fixed data type handling and trimmed form inputs 
- **Mobile Responsiveness**: Enhanced view-proposals page with responsive grid layouts
- **Finder Name Display**: Fixed "Unknown Finder" issue with proper database joins
- **Acceptance Workflow**: Verified "Hire Finder" button creates contracts properly

## Recent Updates - Order Submission System ✅ COMPLETED

**Complete order submission workflow with file upload and auto-release**:
- **Order Submission Page**: Full interface for finders to submit completed work with text descriptions and file attachments
- **Order Review Page**: Client interface to accept/reject submissions with feedback system
- **File Upload System**: Complete ObjectUploader component with object storage integration and ACL management
- **Auto-Release Logic**: Automatic fund release after 3 days (acceptance) or 5 days (no decision)
- **Database Schema**: orderSubmissions table with workflow states, auto-release dates, and file references
- **API Integration**: Complete REST API for order submission, review, and file management
- **Object Storage**: Fully configured bucket with proper ACL handling for private file uploads
- **Frontend Routes**: /orders/submit/:contractId and /orders/review/:contractId integrated into routing system

**Previous Updates - Blog Posts System ✅ COMPLETED**

**Complete blog management and public viewing system**:
- **Admin Blog Interface**: Full CRUD operations for blog posts in admin panel
- **Blog Post Editing**: Complete edit functionality with responsive design
- **WYSIWYG Editor**: Rich text editor with ReactQuill for content creation
- **Draft/Published Control**: Working toggle switch with visual feedback
- **Slug-Based URLs**: Post titles automatically converted to URL-friendly slugs
- **Public Blog Viewing**: Fully functional /blog/:slug routes for published posts
- **Responsive Design**: Mobile-optimized creation and editing forms
- **Database Integration**: Full PostgreSQL schema with blog_posts table
- **API Routes**: Complete REST API for blog management and public access

**Database Export Available**:
- **Full PostgreSQL Dump**: Complete database export in findermeister_database_export.sql
- **Documentation**: Detailed README with import instructions and schema overview
- **Test Data**: Includes admin accounts and sample data for testing

## Latest Update - Enhanced Messaging System ✅ COMPLETED

**Comprehensive client-to-finder messaging system with prominent UI access**:
- **Enhanced Proposals Page**: Added prominent "Message" buttons next to each proposal for direct communication
- **Mobile Dashboard Messaging**: Replaced "My Contracts" with dedicated "Messages" button featuring custom message icon and notification dot
- **Desktop Dashboard Integration**: Added purple "Messages" quick action card for easy access to conversations
- **Complete API Integration**: Full conversation creation, message sending, and threading functionality working
- **Real-time Testing**: Successfully tested client-to-finder message flow with actual conversation creation and replies
- **Multiple Entry Points**: Clients can now initiate conversations from proposals page, mobile dashboard, or desktop dashboard
- **StartConversationButton**: Enhanced existing component integration for seamless messaging experience

## Previous Updates - Mobile Client Interface ✅ COMPLETED

**Redesigned mobile client dashboard to match exact UI mockup**:
- **Mobile Phone Frame**: Exact replica of provided design with rounded corners and shadows
- **User Profile Header**: Red header with user avatar and first name display (defaults to "Tosin")
- **Custom Icon Design**: Hand-crafted icons matching the mockup for each action card
- **2x2 Grid Layout**: Perfect spacing and alignment matching the original design
- **Action Cards**: Post a Request, View Proposals, My Contracts, Settings
- **Bottom Tagline**: "One successful find at a time" positioned at bottom
- **Responsive Detection**: Automatically switches layout on screens under 640px

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