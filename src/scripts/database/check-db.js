import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import fs from 'fs';

// Function to check status of SQLite database
function checkDatabaseStatus() {
    console.log('🔍 Checking SQLite database status...\n');

    try {
        // Check if the database file exists
        console.log('📦 Checking database file...');
        if (!fs.existsSync('./src/database/dev.db')) {
            console.log('❌ dev.db file not found');
            console.log('💡 Run: npm run migrate');
            return false;
        }

        console.log('✅ Database file found\n');

        // Connect to SQLite database
        console.log('🔌 Testing database connection...');
        const sqlite = new Database('./src/database/dev.db');
        const db = drizzle(sqlite);

        // Check SQLite version
        const version = sqlite.prepare('SELECT sqlite_version() as version').get();
        console.log(`✅ SQLite connection working (version: ${version.version})\n`);

        // List tables
        console.log('📋 Tables in database:');
        const tables = sqlite.prepare(`
            SELECT name FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all();

        if (tables.length === 0) {
            console.log('ℹ️  No tables found');
        } else {
            tables.forEach(table => {
                console.log(`  - ${table.name}`);
            });
        }
        console.log();

        // Check applied migrations
        console.log('📝 Applied migrations:');
        try {
            const migrations = sqlite.prepare(`
                SELECT * FROM __drizzle_migrations
                ORDER BY created_at
            `).all();

            if (migrations.length === 0) {
                console.log('ℹ️  No migrations found');
            } else {
                migrations.forEach(migration => {
                    console.log(`  - ${migration.hash} (${migration.created_at})`);
                });
            }
        } catch (error) {
            console.log('ℹ️  Migrations table not found or empty');
        }

        sqlite.close();

        console.log('\n🎉 SQLite database is working correctly!');
        return true;

    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        console.log('\n💡 Possible solutions:');
        console.log('1. Run: npm run migrate');
        console.log('2. Check if the dev.db file is not corrupted');
        console.log('3. Run: npm run db:reset');
        return false;
    }
}

// Execute verification
checkDatabaseStatus();
