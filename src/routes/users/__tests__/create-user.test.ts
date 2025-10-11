import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startServer } from '../../../app.ts'
import type { FastifyInstance } from 'fastify'
import { generateUserMock, generateUserMocks } from '../../../tests/utils/mocks/user.mock.ts'
import { db } from '../../../database/client.ts'
import { users } from '../../../database/schema.ts'
import { cleanDatabase } from '../../../tests/utils/database.ts'

// Server instance
let app: FastifyInstance

// Start the server before all tests
beforeAll(async () => {
    app = await startServer()
    await app.ready() // Wait for server to be ready
})

// Clean database before each test to ensure isolation
beforeEach(async () => {
    await cleanDatabase()
})

// Close the server after all tests
afterAll(async () => {
    await app.close()
})

test('Create a new user should return 201', async () => {
    // Generate a mock user
    const mockUser = generateUserMock()
    // Create a new user
    const response = await request(app.server)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send({
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email
    })

    // Check if the user was created
    expect(response.status).toEqual(201)
    expect(response.body).toEqual({
        success: true,
        data: {
            id: expect.any(Number),
            first_name: mockUser.first_name,
            last_name: mockUser.last_name,
            email: mockUser.email,
            created_at: expect.any(Number),
            updated_at: expect.any(Number)
        }
    })
})

test('POST /users should create multiple users', async () => {
    const mockUsers = generateUserMocks(3)

    const response = await request(app.server)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send(mockUsers.map(u => ({
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email
        })))
        .expect(201)

    expect(response.body).toHaveProperty('success', true)
    expect(response.body.data).toHaveProperty('users')
    expect(response.body.data.users).toHaveLength(3)
    expect(response.body.data).toHaveProperty('total', 3)
})

test('POST /users should fail with duplicate email', async () => {
    const mockUser = generateUserMock()

    // Create first user
    await db.insert(users).values({
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email
    })

    // Try to create duplicate
    const response = await request(app.server)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
            first_name: 'Different',
            last_name: 'Name',
            email: mockUser.email
        })
        .expect(500)

    expect(response.body).toHaveProperty('error')
})

test('POST /users should validate required fields', async () => {
    const response = await request(app.server)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
            first_name: 'John'
            // Missing last_name and email
        })
        .expect(400)

    expect(response.body).toHaveProperty('message')
})

test('POST /users should validate email format', async () => {
    const mockUser = generateUserMock()

    const response = await request(app.server)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
            first_name: mockUser.first_name,
            last_name: mockUser.last_name,
            email: 'invalid-email'
        })
        .expect(400)

    expect(response.body).toHaveProperty('message')
})
