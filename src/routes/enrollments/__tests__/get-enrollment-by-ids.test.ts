import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startServer } from '../../../app.ts'
import type { FastifyInstance } from 'fastify'
import { makeUser } from '../../../tests/factories/make-user.ts'
import { makeCourse } from '../../../tests/factories/make-course.ts'
import { makeEnrollment } from '../../../tests/factories/make-enrollment.ts'
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

test('GET /enrollments/:user_id/:course_id should return enrollment by user_id and course_id', async () => {
    // Create user, course and enrollment using factories
    const user = await makeUser()
    const course = await makeCourse()
    await makeEnrollment({ user_id: user.id, course_id: course.id })

    const response = await request(app.server)
        .get(`/enrollments/${user.id}/${course.id}`)
        .expect(200)

    expect(response.body).toEqual({
        enrollment: {
            user_id: user.id,
            course_id: course.id,
            user_name: `${user.first_name} ${user.last_name}`,
            course_title: course.title,
            created_at: expect.any(Number),
            updated_at: expect.any(Number)
        }
    })
})

test('GET /enrollments/:user_id/:course_id should return 404 when enrollment does not exist', async () => {
    const response = await request(app.server)
        .get('/enrollments/99999/99999')
        .expect(404)

    expect(response.body).toEqual({})
})

test('GET /enrollments/:user_id/:course_id should validate user_id param', async () => {
    const response = await request(app.server)
        .get('/enrollments/invalid-id/1')
        .expect(400)

    expect(response.body).toHaveProperty('message')
})

test('GET /enrollments/:user_id/:course_id should validate course_id param', async () => {
    const response = await request(app.server)
        .get('/enrollments/1/invalid-id')
        .expect(400)

    expect(response.body).toHaveProperty('message')
})

test('GET /enrollments/:user_id/:course_id should return correct timestamps', async () => {
    // Create user, course and enrollment using factories
    const user = await makeUser()
    const course = await makeCourse()
    await makeEnrollment({ user_id: user.id, course_id: course.id })

    const response = await request(app.server)
        .get(`/enrollments/${user.id}/${course.id}`)
        .expect(200)

    // Verify timestamps are valid numbers
    expect(response.body.enrollment.created_at).toBeGreaterThan(0)
    expect(response.body.enrollment.updated_at).toBeGreaterThan(0)
    expect(typeof response.body.enrollment.created_at).toBe('number')
    expect(typeof response.body.enrollment.updated_at).toBe('number')
})
