import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// SQLite para desenvolvimento local - funciona perfeitamente no Windows
const sqlite = new Database('./src/database/dev.db');
export const db = drizzle(sqlite);