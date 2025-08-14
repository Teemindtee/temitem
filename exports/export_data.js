const { neon } = require('@neondatabase/serverless');
const fs = require('fs').promises;

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
