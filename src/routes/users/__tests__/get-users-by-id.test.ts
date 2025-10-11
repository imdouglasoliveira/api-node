import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startServer } from '../../../app.ts'
import type { FastifyInstance } from 'fastify'
import { makeUser } from '../../../tests/factories/make-user.ts'
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

test('GET /users/:id should return user by id', async () => {
    // Create a user using factory
    const user = await makeUser()

    const response = await request(app.server)
        .get(`/users/${user.id}`)
        .expect(200)

    expect(response.body).toEqual({
        user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            created_at: expect.any(Number),
            updated_at: expect.any(Number)
        }
    })
})

test('GET /users/:id should return 404 when user does not exist', async () => {
    const response = await request(app.server)
        .get('/users/99999')
        .expect(404)

    expect(response.body).toEqual({})
})

test('GET /users/:id should validate id param', async () => {
    const response = await request(app.server)
        .get('/users/invalid-id')
        .expect(400)

    expect(response.body).toHaveProperty('message')
})

test('GET /users/:id should return correct timestamps', async () => {
    // Create a user using factory
    const user = await makeUser()

    const response = await request(app.server)
        .get(`/users/${user.id}`)
        .expect(200)

    // Verify timestamps are valid numbers
    expect(response.body.user.created_at).toBeGreaterThan(0)
    expect(response.body.user.updated_at).toBeGreaterThan(0)
    expect(typeof response.body.user.created_at).toBe('number')
    expect(typeof response.body.user.updated_at).toBe('number')
})
