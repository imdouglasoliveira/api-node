import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Function to apply SQLite migrations
function applyMigration(migrationFile) {
    console.log(`📦 Applying migration: ${migrationFile}`);

    try {
        // Read migration file
        const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

        // Connect to SQLite database
        const sqlite = new Database('./src/database/dev.db');
        const db = drizzle(sqlite);

        // Execute migration
        sqlite.exec(migrationSQL);

        console.log('✅ Migration applied successfully!');

        sqlite.close();

    } catch (error) {
        console.error('❌ Error applying migration:', error.message);
        process.exit(1);
    }
}

// Main function
function main() {
    const drizzleDir = './drizzle';

    if (!fs.existsSync(drizzleDir)) {
        console.error('❌ Drizzle directory not found');
        process.exit(1);
    }

    // List migration files
    const migrationFiles = fs.readdirSync(drizzleDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

    if (migrationFiles.length === 0) {
        console.log('ℹ️  No migrations found');
        return;
    }

    console.log(`📋 Migrations found: ${migrationFiles.length}`);

    // Apply each migration
    migrationFiles.forEach(file => {
        const fullPath = path.join(drizzleDir, file);
        applyMigration(fullPath);
    });

    console.log('🎉 All migrations have been applied!');
}

// Execute if called directly
main();

export { applyMigration };
