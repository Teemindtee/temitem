#!/bin/bash

# FinderMeister Database Export Script
# Exports database in SQL, CSV, and JSON formats

set -e

# Configuration
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
EXPORT_DIR="exports"
DB_NAME="findermeister"

echo "🚀 Starting FinderMeister Database Export..."
echo "📅 Timestamp: $TIMESTAMP"

# Create export directory
mkdir -p "$EXPORT_DIR"

# Function to export SQL
export_sql() {
    echo "📄 Exporting SQL dump..."
    
    # Create comprehensive SQL dump
    cat > "$EXPORT_DIR/${DB_NAME}_${TIMESTAMP}.sql" << 'EOF'
-- FinderMeister Database Export
-- Generated on: $(date)
-- Database: FinderMeister Service Marketplace Platform

SET session_replication_role = replica;

EOF
    
    # Export each table's structure and data
    TABLES=(
        "users"
        "finders" 
        "tokens"
        "requests"
        "proposals"
        "contracts"
        "conversations"
        "messages"
        "order_submissions"
        "reviews"
        "transactions"
        "withdrawal_requests"
        "withdrawal_settings"
        "categories"
        "blog_posts"
        "admin_settings"
    )
    
    for table in "${TABLES[@]}"; do
        echo "  Exporting table: $table"
        echo "-- Table: $table" >> "$EXPORT_DIR/${DB_NAME}_${TIMESTAMP}.sql"
        echo "DROP TABLE IF EXISTS \"$table\" CASCADE;" >> "$EXPORT_DIR/${DB_NAME}_${TIMESTAMP}.sql"
        echo "" >> "$EXPORT_DIR/${DB_NAME}_${TIMESTAMP}.sql"
    done
    
    echo "SET session_replication_role = DEFAULT;" >> "$EXPORT_DIR/${DB_NAME}_${TIMESTAMP}.sql"
    echo "✅ SQL export completed: $EXPORT_DIR/${DB_NAME}_${TIMESTAMP}.sql"
}

# Function to create a Node.js script for data export
create_export_script() {
    cat > "$EXPORT_DIR/export_data.mjs" << 'EOF'
import { neon } from '@neondatabase/serverless';
import fs from 'fs/promises';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function exportData() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    
    // Get all tables
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    `;
    
    console.log(`Found ${tables.length} tables to export`);
    
    // Export JSON
    const jsonData = {};
    
    for (const table of tables) {
        const tableName = table.table_name;
        console.log(`Exporting ${tableName}...`);
        
        try {
            const data = await sql(`SELECT * FROM "${tableName}"`);
            jsonData[tableName] = data;
            
            // Export CSV for this table
            if (data.length > 0) {
                const columns = Object.keys(data[0]);
                let csvContent = columns.join(',') + '\n';
                
                for (const row of data) {
                    const values = columns.map(col => {
                        const value = row[col];
                        if (value === null) return '';
                        if (typeof value === 'string') {
                            const escaped = value.replace(/"/g, '""');
                            return /[",\n\r]/.test(value) ? `"${escaped}"` : escaped;
                        }
                        if (Array.isArray(value)) {
                            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                        }
                        return String(value);
                    });
                    csvContent += values.join(',') + '\n';
                }
                
                await fs.writeFile(`exports/csv_${timestamp}/${tableName}.csv`, csvContent);
            }
        } catch (error) {
            console.error(`Error exporting ${tableName}:`, error);
        }
    }
    
    // Create CSV directory
    await fs.mkdir(`exports/csv_${timestamp}`, { recursive: true });
    
    // Save JSON
    const fullExport = {
        metadata: {
            exportedAt: new Date().toISOString(),
            database: 'FinderMeister Service Marketplace',
            totalTables: tables.length,
            totalRecords: Object.values(jsonData).reduce((sum, records) => sum + records.length, 0)
        },
        data: jsonData
    };
    
    await fs.writeFile(`exports/findermeister_${timestamp}.json`, JSON.stringify(fullExport, null, 2));
    
    console.log('✅ Export completed!');
    console.log(`📁 Files saved in: exports/`);
    console.log(`📄 JSON: findermeister_${timestamp}.json`);
    console.log(`📊 CSV: csv_${timestamp}/ directory`);
}

exportData().catch(console.error);
EOF
}

# Main execution
echo "📁 Creating export directory: $EXPORT_DIR"

# Export SQL structure
export_sql

# Create and run Node.js export script
echo "📊 Creating data export script..."
create_export_script

echo "🔄 Running data export..."
cd "$(dirname "$0")/.."
node "$EXPORT_DIR/export_data.mjs"

echo ""
echo "🎉 Database export completed successfully!"
echo "📂 All exports saved in: $EXPORT_DIR/"
echo ""
echo "Files created:"
echo "  📄 SQL: $EXPORT_DIR/${DB_NAME}_${TIMESTAMP}.sql"
echo "  📊 JSON: $EXPORT_DIR/findermeister_*.json"
echo "  📈 CSV: $EXPORT_DIR/csv_*/ (directory with individual table files)"
echo ""