import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startServer } from '../../../app.ts'
import type { FastifyInstance } from 'fastify'
import { generateUserMocks } from '../../../tests/utils/mocks/user.mock.ts'
import { db } from '../../../database/client.ts'
import { users } from '../../../database/schema.ts'
import { cleanDatabase } from '../../../tests/utils/database.ts'

let app: FastifyInstance

beforeAll(async () => {
    app = await startServer()
    await app.ready()
})

// Clean database before each test to ensure isolation
beforeEach(async () => {
    await cleanDatabase()
})

afterAll(async () => {
    await app.close()
})

test('GET /users should return empty list when no users exist', async () => {
    const response = await request(app.server)
        .get('/users')
        .expect(200)

    expect(response.body).toEqual({
        users: [],
        currentPage: 1,
        perPage: 10,
        totalItems: 0,
        totalPages: 0
    })
})

test('GET /users should return paginated users', async () => {
    // Create 5 users for testing
    const mockUsers = generateUserMocks(5)
    await db.insert(users).values(
        mockUsers.map(user => ({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
        }))
    )

    const response = await request(app.server)
        .get('/users')
        .expect(200)

    expect(response.body.users).toHaveLength(5)
    expect(response.body.totalItems).toBe(5)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.perPage).toBe(10)
    expect(response.body.totalPages).toBe(1)
})

test('GET /users should respect pagination params', async () => {
    // Create 15 users
    const mockUsers = generateUserMocks(15)
    await db.insert(users).values(
        mockUsers.map(user => ({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
        }))
    )

    // Get page 1 with limit 5
    const response = await request(app.server)
        .get('/users?page=1&limit=5')
        .expect(200)

    expect(response.body.users).toHaveLength(5)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.perPage).toBe(5)
    expect(response.body.totalItems).toBe(15)
    expect(response.body.totalPages).toBe(3)
})

test('GET /users should filter by search param', async () => {
    // Create users with specific first names
    await db.insert(users).values([
        { first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
        { first_name: 'Maria', last_name: 'Santos', email: 'maria@test.com' },
        { first_name: 'José', last_name: 'Oliveira', email: 'jose@test.com' }
    ])

    const response = await request(app.server)
        .get('/users?search=jo')
        .expect(200)

    expect(response.body.users).toHaveLength(2)
    expect(response.body.users[0].first_name.toLowerCase()).toContain('jo')
})

test('GET /users should order by first_name', async () => {
    // Create users
    await db.insert(users).values([
        { first_name: 'Zebra', last_name: 'User', email: 'zebra@test.com' },
        { first_name: 'Alpha', last_name: 'User', email: 'alpha@test.com' },
        { first_name: 'Beta', last_name: 'User', email: 'beta@test.com' }
    ])

    const response = await request(app.server)
        .get('/users?orderBy=first_name')
        .expect(200)

    expect(response.body.users[0].first_name).toBe('Alpha')
    expect(response.body.users[1].first_name).toBe('Beta')
    expect(response.body.users[2].first_name).toBe('Zebra')
})
