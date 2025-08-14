const fs = require('fs');
const path = require('path');

// Database export utility - creates comprehensive CSV and JSON exports
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

const tables = [
  'users', 'finders', 'requests', 'proposals', 'contracts', 
  'conversations', 'messages', 'reviews', 'tokens', 'transactions',
  'withdrawal_requests', 'withdrawal_settings', 'categories', 
  'admin_settings', 'blog_posts', 'order_submissions'
];

async function exportDatabase() {
  try {
    await client.connect();
    console.log('Connected to database for export...');
    
    // Create exports directory
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    const csvDir = path.join(exportsDir, 'csv');
    const jsonDir = path.join(exportsDir, 'json');
    
    if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir);
    if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir);

    const exportData = {
      export_date: new Date().toISOString(),
      database_name: 'findermeister',
      tables: {}
    };

    for (const table of tables) {
      try {
        console.log(`Exporting table: ${table}...`);
        
        // Get table data
        const result = await client.query(`SELECT * FROM ${table}`);
        const data = result.rows;
        
        exportData.tables[table] = {
          record_count: data.length,
          data: data
        };

        // Export as JSON
        const jsonData = {
          table_name: table,
          export_date: new Date().toISOString(),
          record_count: data.length,
          data: data
        };
        
        fs.writeFileSync(
          path.join(jsonDir, `${table}.json`), 
          JSON.stringify(jsonData, null, 2)
        );

        // Export as CSV
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          let csvContent = headers.join(',') + '\n';
          
          data.forEach(row => {
            const values = headers.map(header => {
              let value = row[header];
              if (value === null) return '';
              if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
              if (typeof value === 'string' && value.includes(',')) return `"${value.replace(/"/g, '""')}"`;
              return value;
            });
            csvContent += values.join(',') + '\n';
          });
          
          fs.writeFileSync(path.join(csvDir, `${table}.csv`), csvContent);
        }
        
        console.log(`✓ Exported ${table}: ${data.length} records`);
      } catch (error) {
        console.warn(`⚠ Warning: Could not export table ${table} - ${error.message}`);
        exportData.tables[table] = {
          error: error.message,
          record_count: 0
        };
      }
    }

    // Create complete database export JSON
    fs.writeFileSync(
      path.join(exportsDir, 'complete_database_export.json'), 
      JSON.stringify(exportData, null, 2)
    );

    // Create export README
    const readme = `# FinderMeister Database Export

Export Date: ${new Date().toISOString()}

## Files Included

### CSV Files (exports/csv/)
${Object.keys(exportData.tables).map(table => `- ${table}.csv (${exportData.tables[table].record_count || 0} records)`).join('\n')}

### JSON Files (exports/json/)
${Object.keys(exportData.tables).map(table => `- ${table}.json (${exportData.tables[table].record_count || 0} records)`).join('\n')}

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
\`\`\`sql
COPY table_name FROM '/path/to/table_name.csv' DELIMITER ',' CSV HEADER;
\`\`\`

### JSON Import (Application Level)
Use the JSON files for application-level imports or data analysis tools.

## Notes
- Passwords are bcrypt hashed for security
- Array fields are JSON formatted in CSV exports
- All timestamps are in ISO 8601 format
- NULL values appear as empty strings in CSV format
`;

    fs.writeFileSync(path.join(exportsDir, 'README.md'), readme);

    console.log('\n🎉 Database export completed successfully!');
    console.log(`📁 Exports saved to: ${exportsDir}`);
    console.log(`📊 Total tables exported: ${Object.keys(exportData.tables).length}`);
    console.log(`📈 Total records: ${Object.values(exportData.tables).reduce((sum, table) => sum + (table.record_count || 0), 0)}`);

  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    await client.end();
  }
}

// Run the export
exportDatabase();