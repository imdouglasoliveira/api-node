import { config } from 'dotenv'
import { beforeAll, afterAll } from 'vitest'
import { closeTestDatabase, cleanDatabase } from './utils/database.ts'

// Load .env.test
config({ path: '.env.test' })

// Clean database before ALL tests
beforeAll(async () => {
    console.log('🧹 Cleaning test database...')
    await cleanDatabase()
})

// Close connection after ALL tests
afterAll(() => {
    console.log('🔒 Closing connection with test database...')
    closeTestDatabase()
})