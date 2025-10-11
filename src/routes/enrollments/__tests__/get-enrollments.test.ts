import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startServer } from '../../../app.ts'
import type { FastifyInstance } from 'fastify'
import { generateUserMock } from '../../../tests/utils/mocks/user.mock.ts'
import { generateCourseMock } from '../../../tests/utils/mocks/course.mock.ts'
import { db } from '../../../database/client.ts'
import { users, courses, enrollments } from '../../../database/schema.ts'
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

test('GET /enrollments should return empty list when no enrollments exist', async () => {
    const response = await request(app.server)
        .get('/enrollments')
        .expect(200)

    expect(response.body).toEqual({
        enrollments: [],
        currentPage: 1,
        perPage: 10,
        totalItems: 0,
        totalPages: 0
    })
})

test('GET /enrollments should return paginated enrollments', async () => {
    // Create users and courses
    const mockUser = generateUserMock()
    const [createdUser] = await db.insert(users).values({
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email
    }).returning()

    const mockCourse1 = generateCourseMock()
    const mockCourse2 = generateCourseMock()
    const [createdCourse1] = await db.insert(courses).values({
        title: mockCourse1.title,
        description: mockCourse1.description
    }).returning()
    const [createdCourse2] = await db.insert(courses).values({
        title: mockCourse2.title,
        description: mockCourse2.description
    }).returning()

    // Create enrollments
    await db.insert(enrollments).values([
        { user_id: createdUser.id, course_id: createdCourse1.id },
        { user_id: createdUser.id, course_id: createdCourse2.id }
    ])

    const response = await request(app.server)
        .get('/enrollments')
        .expect(200)

    expect(response.body.enrollments).toHaveLength(2)
    expect(response.body.totalItems).toBe(2)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.perPage).toBe(10)
    expect(response.body.totalPages).toBe(1)
})

test('GET /enrollments should respect pagination params', async () => {
    // Create user and courses
    const mockUser = generateUserMock()
    const [createdUser] = await db.insert(users).values({
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email
    }).returning()

    // Create 15 courses and enrollments
    for (let i = 0; i < 15; i++) {
        const mockCourse = generateCourseMock()
        const [createdCourse] = await db.insert(courses).values({
            title: `${mockCourse.title} ${i}`,
            description: mockCourse.description
        }).returning()

        await db.insert(enrollments).values({
            user_id: createdUser.id,
            course_id: createdCourse.id
        })
    }

    // Get page 1 with limit 5
    const response = await request(app.server)
        .get('/enrollments?page=1&limit=5')
        .expect(200)

    expect(response.body.enrollments).toHaveLength(5)
    expect(response.body.currentPage).toBe(1)
    expect(response.body.perPage).toBe(5)
    expect(response.body.totalItems).toBe(15)
    expect(response.body.totalPages).toBe(3)
})

test('GET /enrollments should filter by user_id', async () => {
    // Create users and courses
    const mockUser1 = generateUserMock()
    const mockUser2 = generateUserMock()
    const [createdUser1] = await db.insert(users).values({
        first_name: mockUser1.first_name,
        last_name: mockUser1.last_name,
        email: mockUser1.email
    }).returning()
    const [createdUser2] = await db.insert(users).values({
        first_name: mockUser2.first_name,
        last_name: mockUser2.last_name,
        email: mockUser2.email
    }).returning()

    const mockCourse = generateCourseMock()
    const [createdCourse] = await db.insert(courses).values({
        title: mockCourse.title,
        description: mockCourse.description
    }).returning()

    // Create enrollments for both users
    await db.insert(enrollments).values([
        { user_id: createdUser1.id, course_id: createdCourse.id },
        { user_id: createdUser2.id, course_id: createdCourse.id }
    ])

    const response = await request(app.server)
        .get(`/enrollments?user_id=${createdUser1.id}`)
        .expect(200)

    expect(response.body.enrollments).toHaveLength(1)
    expect(response.body.enrollments[0].user_id).toBe(createdUser1.id)
})

test('GET /enrollments should filter by course_id', async () => {
    // Create user and courses
    const mockUser = generateUserMock()
    const [createdUser] = await db.insert(users).values({
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email
    }).returning()

    const mockCourse1 = generateCourseMock()
    const mockCourse2 = generateCourseMock()
    const [createdCourse1] = await db.insert(courses).values({
        title: mockCourse1.title,
        description: mockCourse1.description
    }).returning()
    const [createdCourse2] = await db.insert(courses).values({
        title: mockCourse2.title,
        description: mockCourse2.description
    }).returning()

    // Create enrollments for both courses
    await db.insert(enrollments).values([
        { user_id: createdUser.id, course_id: createdCourse1.id },
        { user_id: createdUser.id, course_id: createdCourse2.id }
    ])

    const response = await request(app.server)
        .get(`/enrollments?course_id=${createdCourse1.id}`)
        .expect(200)

    expect(response.body.enrollments).toHaveLength(1)
    expect(response.body.enrollments[0].course_id).toBe(createdCourse1.id)
})

test('GET /enrollments should return enrollment with user and course details', async () => {
    // Create user and course
    const mockUser = generateUserMock()
    const [createdUser] = await db.insert(users).values({
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email
    }).returning()

    const mockCourse = generateCourseMock()
    const [createdCourse] = await db.insert(courses).values({
        title: mockCourse.title,
        description: mockCourse.description
    }).returning()

    // Create enrollment
    await db.insert(enrollments).values({
        user_id: createdUser.id,
        course_id: createdCourse.id
    })

    const response = await request(app.server)
        .get('/enrollments')
        .expect(200)

    expect(response.body.enrollments[0]).toHaveProperty('user_name')
    expect(response.body.enrollments[0]).toHaveProperty('course_title')
    expect(response.body.enrollments[0].user_name).toBe(`${mockUser.first_name} ${mockUser.last_name}`)
    expect(response.body.enrollments[0].course_title).toBe(mockCourse.title)
})
