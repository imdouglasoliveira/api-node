import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startServer } from '../../../app.ts'
import type { FastifyInstance } from 'fastify'
import { generateCourseMock } from '../../../tests/utils/mocks/course.mock.ts'
import { db } from '../../../database/client.ts'
import { courses } from '../../../database/schema.ts'
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

test('GET /courses/:id should return course by id', async () => {
    // Create a course
    const mockCourse = generateCourseMock()
    const [createdCourse] = await db
        .insert(courses)
        .values({
            title: mockCourse.title,
            description: mockCourse.description
        })
        .returning()

    const response = await request(app.server)
        .get(`/courses/${createdCourse.id}`)
        .expect(200)

    expect(response.body).toEqual({
        course: {
            id: createdCourse.id,
            title: mockCourse.title,
            description: mockCourse.description,
            created_at: expect.any(Number),
            updated_at: expect.any(Number)
        }
    })
})

test('GET /courses/:id should return 404 when course does not exist', async () => {
    const response = await request(app.server)
        .get('/courses/99999')
        .expect(404)

    expect(response.body).toEqual({})
})

test('GET /courses/:id should validate id param', async () => {
    const response = await request(app.server)
        .get('/courses/invalid-id')
        .expect(400)

    expect(response.body).toHaveProperty('message')
})

test('GET /courses/:id should return correct timestamps', async () => {
    // Create a course
    const mockCourse = generateCourseMock()
    const [createdCourse] = await db
        .insert(courses)
        .values({
            title: mockCourse.title,
            description: mockCourse.description
        })
        .returning()

    const response = await request(app.server)
        .get(`/courses/${createdCourse.id}`)
        .expect(200)

    // Verify timestamps are valid numbers
    expect(response.body.course.created_at).toBeGreaterThan(0)
    expect(response.body.course.updated_at).toBeGreaterThan(0)
    expect(typeof response.body.course.created_at).toBe('number')
    expect(typeof response.body.course.updated_at).toBe('number')
})
