#!/usr/bin/env tsx
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import fs from 'fs/promises';
import path from 'path';
import { format as formatDate } from 'date-fns';

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Initialize database connection
const sql = neon(DATABASE_URL);
const db = drizzle(sql);

interface ExportOptions {
  format: 'sql' | 'csv' | 'json';
  outputDir: string;
  timestamp: string;
}

// Get all table names
async function getAllTables(): Promise<string[]> {
  const result = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  return result.map(row => row.table_name);
}

// Export data in SQL format
async function exportSQL(options: ExportOptions): Promise<void> {
  const tables = await getAllTables();
  const timestamp = new Date().toISOString();
  
  let sqlContent = `-- FinderMeister Database Export\n`;
  sqlContent += `-- Generated on: ${timestamp}\n`;
  sqlContent += `-- Database: FinderMeister Service Marketplace\n\n`;
  
  sqlContent += `-- Disable foreign key checks for clean import\n`;
  sqlContent += `SET session_replication_role = replica;\n\n`;

  for (const tableName of tables) {
    console.log(`Exporting table: ${tableName}`);
    
    // Get table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = ${tableName} 
      ORDER BY ordinal_position
    `;
    
    sqlContent += `-- Table: ${tableName}\n`;
    sqlContent += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n\n`;
    
    // Get CREATE TABLE statement
    const createTable = await sql`
      SELECT 
        'CREATE TABLE ' || schemaname || '.' || tablename || ' (' ||
        array_to_string(
          array_agg(
            column_name || ' ' || type || 
            case when notnull then ' NOT NULL' else '' end
          ), ', '
        ) || ');' as ddl
      FROM (
        SELECT 
          schemaname, tablename, 
          attname as column_name,
          format_type(atttypid, atttypmod) as type,
          attnotnull as notnull
        FROM pg_attribute 
        JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        WHERE pg_class.relname = ${tableName}
        AND pg_namespace.nspname = 'public'
        AND attnum > 0
        ORDER BY attnum
      ) as cols
      GROUP BY schemaname, tablename
    `;
    
    if (createTable.length > 0) {
      sqlContent += `${createTable[0].ddl}\n\n`;
    }
    
    // Get data
    const data = await sql(`SELECT * FROM "${tableName}"`);
    
    if (data.length > 0) {
      const columnNames = Object.keys(data[0]);
      
      for (const row of data) {
        const values = columnNames.map(col => {
          const value = row[col];
          if (value === null) return 'NULL';
          if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`;
          }
          if (Array.isArray(value)) {
            return `ARRAY[${value.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',')}]`;
          }
          return String(value);
        });
        
        sqlContent += `INSERT INTO "${tableName}" (${columnNames.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
      }
      sqlContent += '\n';
    }
  }
  
  sqlContent += `-- Re-enable foreign key checks\n`;
  sqlContent += `SET session_replication_role = DEFAULT;\n`;
  
  const filename = `${options.outputDir}/findermeister_${options.timestamp}.sql`;
  await fs.writeFile(filename, sqlContent, 'utf8');
  console.log(`SQL export completed: ${filename}`);
}

// Export data in CSV format
async function exportCSV(options: ExportOptions): Promise<void> {
  const tables = await getAllTables();
  const csvDir = `${options.outputDir}/csv_${options.timestamp}`;
  
  // Create CSV directory
  await fs.mkdir(csvDir, { recursive: true });
  
  for (const tableName of tables) {
    console.log(`Exporting CSV for table: ${tableName}`);
    
    const data = await sql(`SELECT * FROM "${tableName}"`);
    
    if (data.length === 0) {
      console.log(`  Table ${tableName} is empty, skipping...`);
      continue;
    }
    
    const columnNames = Object.keys(data[0]);
    let csvContent = columnNames.join(',') + '\n';
    
    for (const row of data) {
      const values = columnNames.map(col => {
        const value = row[col];
        if (value === null) return '';
        if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const escaped = value.replace(/"/g, '""');
          return /[",\n\r]/.test(value) ? `"${escaped}"` : escaped;
        }
        if (Array.isArray(value)) {
          const arrayStr = JSON.stringify(value);
          return `"${arrayStr.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      
      csvContent += values.join(',') + '\n';
    }
    
    const filename = `${csvDir}/${tableName}.csv`;
    await fs.writeFile(filename, csvContent, 'utf8');
  }
  
  console.log(`CSV export completed in directory: ${csvDir}`);
}

// Export data in JSON format
async function exportJSON(options: ExportOptions): Promise<void> {
  const tables = await getAllTables();
  const jsonData: Record<string, any[]> = {};
  
  for (const tableName of tables) {
    console.log(`Exporting JSON for table: ${tableName}`);
    
    const data = await sql(`SELECT * FROM "${tableName}"`);
    jsonData[tableName] = data;
  }
  
  const exportInfo = {
    exportedAt: new Date().toISOString(),
    database: 'FinderMeister Service Marketplace',
    totalTables: tables.length,
    totalRecords: Object.values(jsonData).reduce((sum, records) => sum + records.length, 0),
    tables: Object.keys(jsonData).reduce((acc, table) => {
      acc[table] = jsonData[table].length;
      return acc;
    }, {} as Record<string, number>)
  };
  
  const fullExport = {
    metadata: exportInfo,
    data: jsonData
  };
  
  const filename = `${options.outputDir}/findermeister_${options.timestamp}.json`;
  await fs.writeFile(filename, JSON.stringify(fullExport, null, 2), 'utf8');
  console.log(`JSON export completed: ${filename}`);
  
  // Also create a pretty-printed version with metadata
  const readableFilename = `${options.outputDir}/findermeister_${options.timestamp}_readable.json`;
  const readableContent = {
    ...exportInfo,
    note: "This is a summary. Full data is in the main JSON file.",
    sampleData: Object.keys(jsonData).reduce((acc, table) => {
      acc[table] = jsonData[table].slice(0, 2); // First 2 records as sample
      return acc;
    }, {} as Record<string, any[]>)
  };
  
  await fs.writeFile(readableFilename, JSON.stringify(readableContent, null, 2), 'utf8');
  console.log(`Readable JSON summary: ${readableFilename}`);
}

// Main export function
async function exportDatabase(format: 'sql' | 'csv' | 'json' | 'all' = 'all'): Promise<void> {
  const timestamp = formatDate(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const outputDir = 'exports';
  
  // Create exports directory
  await fs.mkdir(outputDir, { recursive: true });
  
  const options: ExportOptions = {
    format: 'sql', // Will be overridden
    outputDir,
    timestamp
  };
  
  console.log(`Starting database export...`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Output directory: ${outputDir}`);
  
  try {
    if (format === 'all' || format === 'sql') {
      await exportSQL({ ...options, format: 'sql' });
    }
    
    if (format === 'all' || format === 'csv') {
      await exportCSV({ ...options, format: 'csv' });
    }
    
    if (format === 'all' || format === 'json') {
      await exportJSON({ ...options, format: 'json' });
    }
    
    console.log('\n✅ Database export completed successfully!');
    console.log(`📁 All files saved in: ${outputDir}/`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// CLI interface
const format = process.argv[2] as 'sql' | 'csv' | 'json' | 'all' || 'all';

if (!['sql', 'csv', 'json', 'all'].includes(format)) {
  console.log('Usage: npm run export:db [sql|csv|json|all]');
  console.log('  sql  - Export as SQL dump');
  console.log('  csv  - Export as CSV files (one per table)');
  console.log('  json - Export as JSON file');
  console.log('  all  - Export in all formats (default)');
  process.exit(1);
}

exportDatabase(format);