import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startServer } from '../../../app.ts'
import type { FastifyInstance } from 'fastify'
import { generateCourseMocks } from '../../../tests/utils/mocks/course.mock.ts'
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

test('GET /courses should return empty list when no courses exist', async () => {
    const response = await request(app.server)
        .get('/courses')
        .expect(200)

    expect(response.body).toEqual({
        courses: [],
        totalEnrollments: 0,
        currentPage: 1,
        perPage: 10,
        totalItems: 0,
        totalPages: 0
    })
})

test('GET /courses should return paginated courses', async () => {
    // Create 5 courses for testing
    const mockCourses = generateCourseMocks(5)
    await db.insert(courses).values(
        mockCourses.map(course => ({
            title: course.title,
            description: course.description
        }))
    )

    const response = await request(app.server)
        .get('/courses')
        .expect(200)

    expect(response.body.courses).toHaveLength(5)
    expect(response.body.totalItems).toBe(5)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.perPage).toBe(10)
    expect(response.body.totalPages).toBe(1)
})

test('GET /courses should respect pagination params', async () => {
    // Create 15 courses
    const mockCourses = generateCourseMocks(15)
    await db.insert(courses).values(
        mockCourses.map(course => ({
            title: course.title,
            description: course.description
        }))
    )

    // Get page 1 with limit 5
    const response = await request(app.server)
        .get('/courses?page=1&limit=5')
        .expect(200)

    expect(response.body.courses).toHaveLength(5)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.perPage).toBe(5)
    expect(response.body.totalItems).toBe(15)
    expect(response.body.totalPages).toBe(3)
})

test('GET /courses should filter by search param', async () => {
    // Create courses with specific titles
    await db.insert(courses).values([
        { title: 'JavaScript Basics', description: 'Learn JS' },
        { title: 'TypeScript Advanced', description: 'Learn TS' },
        { title: 'Python Fundamentals', description: 'Learn Python' }
    ])

    const response = await request(app.server)
        .get('/courses?search=script')
        .expect(200)

    expect(response.body.courses).toHaveLength(2)
    expect(response.body.courses[0].title).toContain('Script')
    expect(response.body.courses[1].title).toContain('Script')
})

test('GET /courses should order by title', async () => {
    // Create courses
    await db.insert(courses).values([
        { title: 'Zebra Course', description: 'Last' },
        { title: 'Alpha Course', description: 'First' },
        { title: 'Beta Course', description: 'Second' }
    ])

    const response = await request(app.server)
        .get('/courses?orderBy=title')
        .expect(200)

    expect(response.body.courses[0].title).toBe('Alpha Course')
    expect(response.body.courses[1].title).toBe('Beta Course')
    expect(response.body.courses[2].title).toBe('Zebra Course')
})
