import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../database/dev.db');

// Available tables
const AVAILABLE_TABLES = ['users', 'courses', 'enrollments'];

function resetTable(tableName) {
    console.log(`🗑️  Resetting table: ${tableName}`);

    try {
        const sqlite = new Database(DB_PATH);

        // Delete all records
        const deleteStmt = sqlite.prepare(`DELETE FROM ${tableName}`);
        const result = deleteStmt.run();

        // Reset the autoincrement (SQLite)
        const resetStmt = sqlite.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`);
        resetStmt.run(tableName);

        console.log(`✅ Table ${tableName} reset successfully!`);
        console.log(`   Records deleted: ${result.changes}`);

        sqlite.close();

    } catch (error) {
        console.error(`❌ Error resetting table ${tableName}:`, error.message);
        process.exit(1);
    }
}

function resetAllTables() {
    console.log('🗑️  Resetting ALL tables...\n');

    AVAILABLE_TABLES.forEach(table => {
        resetTable(table);
    });

    console.log('\n🎉 All tables have been reset!');
}

// Process arguments from the command line
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === 'all') {
        resetAllTables();
        return;
    }

    const tableName = args[0];

    if (!AVAILABLE_TABLES.includes(tableName)) {
        console.error(`❌ Invalid table: ${tableName}`);
        console.log(`\nAvailable tables: ${AVAILABLE_TABLES.join(', ')}`);
        console.log('\nUsage:');
        console.log('  node reset-table.js [table]');
        console.log('  node reset-table.js all  (reset all tables)');
        console.log('\nExamples:');
        console.log('  node reset-table.js users');
        console.log('  node reset-table.js courses');
        console.log('  node reset-table.js all');
        process.exit(1);
    }

    resetTable(tableName);
}

main();
