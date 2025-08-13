# FinderMeister Database Export

This file contains a complete PostgreSQL database dump for the FinderMeister project.

## Database Contents

The database includes:

### Core Tables
- **users** - User accounts (clients, finders, admins)
- **finders** - Finder profiles with metrics and earnings
- **requests** - Client service requests
- **proposals** - Finder proposals for requests
- **contracts** - Accepted proposals with escrow management
- **reviews** - Client feedback on completed work

### Token & Payment System
- **tokens** - Finder token balances for proposal submissions
- **transactions** - Token purchase/spend history
- **withdrawal_requests** - Finder withdrawal management

### Communication System
- **conversations** - Client-finder message threads
- **messages** - Individual messages in conversations

### Admin Management
- **categories** - Request categories management
- **admin_settings** - Platform configuration settings
- **blog_posts** - Blog content management (NEW)

### Features Included
- ✅ Role-based authentication (client, finder, admin)
- ✅ Token-based proposal system
- ✅ Escrow payment management
- ✅ Real-time messaging between clients and finders
- ✅ Admin panel with user/content management
- ✅ Blog posts system with WYSIWYG editor
- ✅ Mobile-responsive client dashboard
- ✅ Profile management for all user types

## Import Instructions

To import this database:

```bash
# Create a new PostgreSQL database
createdb findermeister_db

# Import the data
psql findermeister_db < database_export.sql
```

## Test Accounts

The database includes these test accounts:

### Admin Account
- Email: admin@findermeister.com
- Password: admin123

### Test Users
- All test user passwords: password123
- Includes sample clients and finders with demo data

## Database Schema

The database uses Drizzle ORM with PostgreSQL and includes:
- UUID primary keys for all tables
- Proper foreign key relationships
- Indexed fields for performance
- Timestamp tracking for audit trails
- Role-based access control

## Recent Updates

- Mobile client dashboard matching UI mockup design
- Blog posts system with slug-based URLs
- WYSIWYG editor for rich content creation
- Enhanced admin management capabilities
- PostgreSQL database migration completed

This export was generated on: August 13, 2025