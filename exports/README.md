# FinderMeister Database Export

Export Date: 2025-08-14T09:59:23.656Z

## Files Included

### CSV Files (exports/csv/)
- users.csv (15 records)
- finders.csv (9 records)
- requests.csv (16 records)
- proposals.csv (13 records)
- contracts.csv (7 records)
- conversations.csv (6 records)
- messages.csv (23 records)
- reviews.csv (2 records)
- tokens.csv (8 records)
- transactions.csv (14 records)
- withdrawal_requests.csv (4 records)
- withdrawal_settings.csv (1 records)
- categories.csv (9 records)
- admin_settings.csv (1 records)
- blog_posts.csv (2 records)
- order_submissions.csv (4 records)

### JSON Files (exports/json/)
- users.json (15 records)
- finders.json (9 records)
- requests.json (16 records)
- proposals.json (13 records)
- contracts.json (7 records)
- conversations.json (6 records)
- messages.json (23 records)
- reviews.json (2 records)
- tokens.json (8 records)
- transactions.json (14 records)
- withdrawal_requests.json (4 records)
- withdrawal_settings.json (1 records)
- categories.json (9 records)
- admin_settings.json (1 records)
- blog_posts.json (2 records)
- order_submissions.json (4 records)

### Complete Export
- complete_database_export.json - All tables in a single JSON file

## Database Schema Summary

### Users & Authentication
- **users** - User accounts (clients, finders, admins)
- **finders** - Finder profiles with stats and skills

### Marketplace
- **requests** - Client service requests
- **proposals** - Finder proposals for requests  
- **contracts** - Accepted proposals and work agreements
- **reviews** - Rating and feedback system

### Communication
- **conversations** - Message threads between users
- **messages** - Individual messages in conversations

### Financial
- **tokens** - Finder proposal tokens
- **transactions** - Payment history
- **withdrawal_requests** - Finder withdrawal requests
- **withdrawal_settings** - Payment method settings

### Platform Management
- **categories** - Request categories
- **admin_settings** - Platform configuration
- **blog_posts** - Content management
- **order_submissions** - Work deliverable submissions

## Import Instructions

### PostgreSQL Import (CSV)
```sql
COPY table_name FROM '/path/to/table_name.csv' DELIMITER ',' CSV HEADER;
```

### JSON Import (Application Level)
Use the JSON files for application-level imports or data analysis tools.

## Notes
- Passwords are bcrypt hashed for security
- Array fields are JSON formatted in CSV exports
- All timestamps are in ISO 8601 format
- NULL values appear as empty strings in CSV format
