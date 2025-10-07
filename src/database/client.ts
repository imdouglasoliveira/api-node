import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const DB_PATH = process.env.NODE_ENV === 'test'
    ? './src/database/test.db'
    : './src/database/dev.db';
// Log the database path
console.log( `Using database: ${DB_PATH}`);

// SQLite for local development - works perfectly on Windows
const sqlite = new Database(DB_PATH);
export const db = drizzle(sqlite);