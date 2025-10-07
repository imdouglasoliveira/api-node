import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startServer } from '../../../app.ts'
import type { FastifyInstance } from 'fastify'
import { generateCourseMock, generateCourseMocks } from '../../../tests/utils/mocks/course.mock.ts'
import { db } from '../../../database/client.ts'
import { courses } from '../../../database/schema.ts'
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

test('Create a new course should return 201', async () => {
    // Generate a mock course
    const mockCourse = generateCourseMock()
    // Create a new course
    const response = await request(app.server)
    .post('/courses')
    .set('Content-Type', 'application/json')
    .send({
        title: mockCourse.title,
        description: mockCourse.description
    })

    // Check if the course was created
    expect(response.status).toEqual(201)
    expect(response.body).toEqual({
        success: true,
        data: {
            id: expect.any(Number),
            title: mockCourse.title,
            description: mockCourse.description,
            created_at: expect.any(Number),
            updated_at: expect.any(Number)
        }
    })
})

test('POST /courses should create multiple courses', async () => {
    const mockCourses = generateCourseMocks(3)

    const response = await request(app.server)
        .post('/courses')
        .set('Content-Type', 'application/json')
        .send(mockCourses.map(c => ({
            title: c.title,
            description: c.description
        })))
        .expect(201)

    expect(response.body).toHaveProperty('success', true)
    expect(response.body.data).toHaveProperty('courses')
    expect(response.body.data.courses).toHaveLength(3)
    expect(response.body.data).toHaveProperty('total', 3)
})

test('POST /courses should fail with duplicate title', async () => {
    const mockCourse = generateCourseMock()

    // Create first course
    await db.insert(courses).values({
        title: mockCourse.title,
        description: mockCourse.description
    })

    // Try to create duplicate
    const response = await request(app.server)
        .post('/courses')
        .set('Content-Type', 'application/json')
        .send({
            title: mockCourse.title,
            description: 'Different description'
        })
        .expect(500)

    expect(response.body).toHaveProperty('error')
})

test('POST /courses should validate required fields', async () => {
    const response = await request(app.server)
        .post('/courses')
        .set('Content-Type', 'application/json')
        .send({
            description: 'Missing title'
        })
        .expect(400)

    expect(response.body).toHaveProperty('message')
})

test('POST /courses should accept null description', async () => {
    const mockCourse = generateCourseMock()

    const response = await request(app.server)
        .post('/courses')
        .set('Content-Type', 'application/json')
        .send({
            title: mockCourse.title,
            description: null
        })
        .expect(201)

    expect(response.body.data.description).toBeNull()
})

