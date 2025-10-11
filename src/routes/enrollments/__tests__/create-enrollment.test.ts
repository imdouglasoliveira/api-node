import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startServer } from '../../../app.ts'
import type { FastifyInstance } from 'fastify'
import { generateUserMock } from '../../../tests/utils/mocks/user.mock.ts'
import { generateCourseMock } from '../../../tests/utils/mocks/course.mock.ts'
import { db } from '../../../database/client.ts'
import { users, courses, enrollments } from '../../../database/schema.ts'
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

test('Create a new enrollment should return 201', async () => {
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

    // Create a new enrollment
    const response = await request(app.server)
    .post('/enrollments')
    .set('Content-Type', 'application/json')
    .send({
        user_id: createdUser.id,
        course_id: createdCourse.id
    })

    // Check if the enrollment was created
    expect(response.status).toEqual(201)
    expect(response.body).toEqual({
        success: true,
        data: {
            user_id: createdUser.id,
            course_id: createdCourse.id,
            created_at: expect.any(Number),
            updated_at: expect.any(Number)
        }
    })
})

test('POST /enrollments should create multiple enrollments', async () => {
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

    const response = await request(app.server)
        .post('/enrollments')
        .set('Content-Type', 'application/json')
        .send([
            { user_id: createdUser1.id, course_id: createdCourse.id },
            { user_id: createdUser2.id, course_id: createdCourse.id }
        ])
        .expect(201)

    expect(response.body).toHaveProperty('success', true)
    expect(response.body.data).toHaveProperty('enrollments')
    expect(response.body.data.enrollments).toHaveLength(2)
    expect(response.body.data).toHaveProperty('total', 2)
})

test('POST /enrollments should fail with duplicate enrollment', async () => {
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

    // Create first enrollment
    await db.insert(enrollments).values({
        user_id: createdUser.id,
        course_id: createdCourse.id
    })

    // Try to create duplicate
    const response = await request(app.server)
        .post('/enrollments')
        .set('Content-Type', 'application/json')
        .send({
            user_id: createdUser.id,
            course_id: createdCourse.id
        })
        .expect(500)

    expect(response.body).toHaveProperty('error')
})

test('POST /enrollments should validate required fields', async () => {
    const response = await request(app.server)
        .post('/enrollments')
        .set('Content-Type', 'application/json')
        .send({
            user_id: 1
            // Missing course_id
        })
        .expect(400)

    expect(response.body).toHaveProperty('message')
})

test('POST /enrollments should fail with non-existent user', async () => {
    // Create only a course
    const mockCourse = generateCourseMock()
    const [createdCourse] = await db.insert(courses).values({
        title: mockCourse.title,
        description: mockCourse.description
    }).returning()

    const response = await request(app.server)
        .post('/enrollments')
        .set('Content-Type', 'application/json')
        .send({
            user_id: 99999,
            course_id: createdCourse.id
        })
        .expect(500)

    expect(response.body).toHaveProperty('error')
})

test('POST /enrollments should fail with non-existent course', async () => {
    // Create only a user
    const mockUser = generateUserMock()
    const [createdUser] = await db.insert(users).values({
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email
    }).returning()

    const response = await request(app.server)
        .post('/enrollments')
        .set('Content-Type', 'application/json')
        .send({
            user_id: createdUser.id,
            course_id: 99999
        })
        .expect(500)

    expect(response.body).toHaveProperty('error')
})
