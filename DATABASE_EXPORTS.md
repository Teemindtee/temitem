# FinderMeister Database Exports

Generated on: August 14, 2025 at 09:59 UTC

## Quick Access Files

📁 **Main Export Directory**: `/exports/`
📊 **Complete Database**: `exports/complete_database_export.json` (60KB)
📋 **Documentation**: `exports/README.md`
🗜️ **Compressed Archive**: `exports/findermeister_database_export_20250814.tar.gz`

## File Formats Available

### 1. CSV Format (`/exports/csv/`)
Perfect for Excel, Google Sheets, or database imports:
- ✅ **16 tables** exported as individual CSV files
- ✅ **Headers included** for easy importing
- ✅ **134 total records** across all tables
- ✅ **UTF-8 encoding** for international characters

### 2. JSON Format (`/exports/json/`)
Ideal for applications, APIs, or data analysis:
- ✅ **Structured data** with metadata for each table
- ✅ **Type-safe exports** preserving data types
- ✅ **Array fields properly formatted**
- ✅ **Timestamps in ISO 8601 format**

### 3. Complete Database JSON
Single file containing entire database:
- ✅ **All tables in one file**: `complete_database_export.json`
- ✅ **Export metadata** including date and record counts
- ✅ **60KB compressed** - easy to share or backup

## Database Statistics

| Category | Tables | Records |
|----------|--------|---------|
| **Users & Auth** | 2 | 24 records |
| **Marketplace** | 4 | 42 records |  
| **Communication** | 2 | 29 records |
| **Financial** | 4 | 27 records |
| **Platform** | 4 | 12 records |
| **TOTAL** | **16** | **134 records** |

## Key Tables Exported

### Core Platform Data
- **users.csv** - 15 user accounts (clients, finders, admins)
- **finders.csv** - 9 finder profiles with earnings and ratings
- **requests.csv** - 16 service requests from clients
- **proposals.csv** - 13 finder proposals for jobs

### Business Operations  
- **contracts.csv** - 7 active/completed work agreements
- **transactions.csv** - 14 payment records
- **withdrawal_requests.csv** - 4 finder withdrawal requests
- **reviews.csv** - 2 completed job reviews

### Communication
- **conversations.csv** - 6 message threads
- **messages.csv** - 23 individual messages

### Platform Management
- **categories.csv** - 9 service categories
- **admin_settings.csv** - Platform configuration
- **blog_posts.csv** - 2 published blog posts
- **tokens.csv** - 8 proposal token records

## Import Instructions

### PostgreSQL (from CSV)
```sql
-- Example for users table
COPY users FROM '/path/to/users.csv' DELIMITER ',' CSV HEADER;
```

### MySQL (from CSV)  
```sql
-- Example for users table
LOAD DATA INFILE '/path/to/users.csv' 
INTO TABLE users 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n' 
IGNORE 1 ROWS;
```

### Application Import (from JSON)
```javascript
// Example: Import users data
const userData = require('./exports/json/users.json');
console.log(`Importing ${userData.record_count} users...`);
userData.data.forEach(user => {
  // Process each user record
});
```

## Security Notes

⚠️ **Important**: 
- Passwords are bcrypt hashed (secure)
- No sensitive API keys included
- User data is included for platform functionality
- Handle exports according to your privacy policy

## File Integrity

All exports include:
- ✅ Record counts for verification
- ✅ Export timestamps  
- ✅ Table metadata
- ✅ Complete field mapping
- ✅ Null value handling

---

**Need Help?** Check the detailed README.md in the exports folder for more information about each table and import procedures.