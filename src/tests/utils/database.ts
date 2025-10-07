import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { users, courses, enrollments } from '../../database/schema.ts'

const TEST_DB_PATH = './src/database/test.db'

let testDb: ReturnType<typeof drizzle> | null = null
let sqlite: Database.Database | null = null

export function getTestDatabase() {
    // Check if the test database exists
    if (!testDb) {
        // Create the test database
        sqlite = new Database(TEST_DB_PATH)
        testDb = drizzle(sqlite)        
        // Apply migrations to the test database
        migrate(testDb, { migrationsFolder: './drizzle' })
    }
    return testDb
}

export async function cleanDatabase() {
    const db = getTestDatabase()
    
    // Clean all tables (order matters because of the FK)
    await db.delete(enrollments)
    await db.delete(courses)
    await db.delete(users)
}

export function closeTestDatabase() {
    if (sqlite) {
        sqlite.close()
        sqlite = null
        testDb = null
    }
}