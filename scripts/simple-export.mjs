#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import fs from 'fs/promises';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function exportDatabase() {
    const timestamp = new Date().toISOString().split('T')[0] + '_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    
    console.log('🚀 Starting FinderMeister Database Export...');
    console.log(`📅 Timestamp: ${timestamp}`);
    
    // Create exports directory
    await fs.mkdir('exports', { recursive: true });
    await fs.mkdir(`exports/csv_${timestamp}`, { recursive: true });
    
    // Get all tables
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    `;
    
    console.log(`📊 Found ${tables.length} tables to export`);
    
    const jsonData = {};
    const exportStats = {
        totalTables: tables.length,
        tablesWithData: 0,
        totalRecords: 0,
        tableRecordCounts: {}
    };
    
    // Export each table
    for (const table of tables) {
        const tableName = table.table_name;
        console.log(`📋 Exporting ${tableName}...`);
        
        try {
            const data = await sql(`SELECT * FROM "${tableName}"`);
            jsonData[tableName] = data;
            exportStats.tableRecordCounts[tableName] = data.length;
            exportStats.totalRecords += data.length;
            
            if (data.length > 0) {
                exportStats.tablesWithData++;
                
                // Export CSV for this table
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
                console.log(`  ✅ CSV: ${data.length} records exported`);
            } else {
                console.log(`  ⚠️  Table ${tableName} is empty`);
            }
        } catch (error) {
            console.error(`  ❌ Error exporting ${tableName}:`, error.message);
            jsonData[tableName] = [];
            exportStats.tableRecordCounts[tableName] = 0;
        }
    }
    
    // Create comprehensive JSON export
    const fullExport = {
        metadata: {
            exportedAt: new Date().toISOString(),
            database: 'FinderMeister Service Marketplace',
            version: '1.0',
            description: 'Complete database export including all tables and data',
            ...exportStats
        },
        data: jsonData
    };
    
    // Save main JSON file
    await fs.writeFile(`exports/findermeister_${timestamp}.json`, JSON.stringify(fullExport, null, 2));
    
    // Save readable summary
    const summary = {
        exportSummary: {
            ...exportStats,
            exportedAt: new Date().toISOString(),
            database: 'FinderMeister Service Marketplace'
        },
        tablePreview: Object.keys(jsonData).reduce((acc, table) => {
            const data = jsonData[table];
            acc[table] = {
                recordCount: data.length,
                sampleRecord: data.length > 0 ? data[0] : null
            };
            return acc;
        }, {})
    };
    
    await fs.writeFile(`exports/findermeister_${timestamp}_summary.json`, JSON.stringify(summary, null, 2));
    
    // Create SQL dump with actual data
    let sqlContent = `-- FinderMeister Database Export\n`;
    sqlContent += `-- Generated on: ${new Date().toISOString()}\n`;
    sqlContent += `-- Database: FinderMeister Service Marketplace\n`;
    sqlContent += `-- Total Tables: ${exportStats.totalTables}\n`;
    sqlContent += `-- Total Records: ${exportStats.totalRecords}\n\n`;
    
    sqlContent += `-- Disable foreign key checks for clean import\n`;
    sqlContent += `SET session_replication_role = replica;\n\n`;
    
    for (const tableName of Object.keys(jsonData)) {
        const data = jsonData[tableName];
        
        if (data.length > 0) {
            sqlContent += `-- Table: ${tableName} (${data.length} records)\n`;
            
            const columns = Object.keys(data[0]);
            
            for (const row of data) {
                const values = columns.map(col => {
                    const value = row[col];
                    if (value === null) return 'NULL';
                    if (typeof value === 'string') {
                        return `'${value.replace(/'/g, "''")}'`;
                    }
                    if (Array.isArray(value)) {
                        return `ARRAY[${value.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',')}]`;
                    }
                    if (value instanceof Date) {
                        return `'${value.toISOString()}'`;
                    }
                    return String(value);
                });
                
                sqlContent += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
            }
            sqlContent += '\n';
        }
    }
    
    sqlContent += `-- Re-enable foreign key checks\n`;
    sqlContent += `SET session_replication_role = DEFAULT;\n`;
    
    await fs.writeFile(`exports/findermeister_${timestamp}.sql`, sqlContent);
    
    console.log('\n🎉 Database export completed successfully!');
    console.log('📂 Files created:');
    console.log(`  📄 SQL: exports/findermeister_${timestamp}.sql`);
    console.log(`  📊 JSON: exports/findermeister_${timestamp}.json`);
    console.log(`  📋 Summary: exports/findermeister_${timestamp}_summary.json`);
    console.log(`  📈 CSV Directory: exports/csv_${timestamp}/`);
    console.log('\n📊 Export Statistics:');
    console.log(`  Total Tables: ${exportStats.totalTables}`);
    console.log(`  Tables with Data: ${exportStats.tablesWithData}`);
    console.log(`  Total Records: ${exportStats.totalRecords}`);
    
    if (exportStats.tablesWithData > 0) {
        console.log('\n📋 Tables with data:');
        Object.keys(exportStats.tableRecordCounts).forEach(table => {
            const count = exportStats.tableRecordCounts[table];
            if (count > 0) {
                console.log(`  • ${table}: ${count} records`);
            }
        });
    }
}

exportDatabase().catch(console.error);