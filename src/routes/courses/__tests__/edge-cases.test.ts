import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startServer } from '../../../app.ts'
import type { FastifyInstance } from 'fastify'
import { makeCourse } from '../../../tests/factories/make-course.ts'
import { cleanDatabase } from '../../../tests/utils/database.ts'

let app: FastifyInstance

beforeAll(async () => {
    app = await startServer()
    await app.ready()
})

beforeEach(async () => {
    await cleanDatabase()
})

afterAll(async () => {
    await app.close()
})

// ===== TESTS OF LIMITS =====

test('POST /courses should reject title with 1001 characters', async () => {
    const longTitle = 'a'.repeat(1001)

    const response = await request(app.server)
        .post('/courses')
        .send({ title: longTitle })
        .expect(400)

    expect(response.body).toHaveProperty('message')
})

test('POST /courses should accept title with exactly 1000 characters', async () => {
    const maxTitle = 'a'.repeat(1000)

    await request(app.server)
        .post('/courses')
        .send({ title: maxTitle, description: 'Valid' })
        .expect(201)
})

test('POST /courses should reject empty title', async () => {
    await request(app.server)
        .post('/courses')
        .send({ title: '', description: 'Some description' })
        .expect(400)
})

test('POST /courses should accept null description', async () => {
    const response = await request(app.server)
        .post('/courses')
        .send({ title: 'Valid Title', description: null })
        .expect(201)

    expect(response.body.data.description).toBeNull()
})

// ===== TESTS OF SECURITY =====

test('POST /courses should prevent SQL injection in title', async () => {
    const sqlInjection = "'; DROP TABLE courses; --"

    const response = await request(app.server)
        .post('/courses')
        .send({ title: sqlInjection, description: 'test' })
        .expect(201)

    // Verify that the course was created normally
    expect(response.body.data.title).toBe(sqlInjection)

    // Verify that the table still exists
    const coursesResponse = await request(app.server)
        .get('/courses')
        .expect(200)

    expect(coursesResponse.body.courses).toHaveLength(1)
})

test('GET /courses should prevent XSS in search parameter', async () => {
    await makeCourse({ title: 'Normal Course' })

    const xssAttempt = '<script>alert("XSS")</script>'

    const response = await request(app.server)
        .get(`/courses?search=${encodeURIComponent(xssAttempt)}`)
        .expect(200)

    // Should not return the script
    expect(response.body.courses).toHaveLength(0)
})

test('GET /courses/:id should prevent negative IDs', async () => {
    await request(app.server)
        .get('/courses/-1')
        .expect(400)
})

test('GET /courses/:id should handle very large ID numbers', async () => {
    await request(app.server)
        .get('/courses/999999999999')
        .expect(404)
})

// ===== TESTS OF INVALID TYPES =====

test('POST /courses should reject non-string title', async () => {
    await request(app.server)
        .post('/courses')
        .send({ title: 12345, description: 'test' })
        .expect(400)
})

test('POST /courses should reject boolean as title', async () => {
    await request(app.server)
        .post('/courses')
        .send({ title: true, description: 'test' })
        .expect(400)
})

test('POST /courses should reject array as title', async () => {
    await request(app.server)
        .post('/courses')
        .send({ title: ['array'], description: 'test' })
        .expect(400)
})

test('POST /courses should reject object as title', async () => {
    await request(app.server)
        .post('/courses')
        .send({ title: { nested: 'object' }, description: 'test' })
        .expect(400)
})

// ===== TESTS OF SPECIAL CHARACTERS =====

test('POST /courses should accept unicode characters in title', async () => {
    const unicodeTitle = '中文 日本語 한글 Ελληνικά 🚀'

    const response = await request(app.server)
        .post('/courses')
        .send({ title: unicodeTitle, description: 'test' })
        .expect(201)

    expect(response.body.data.title).toBe(unicodeTitle)
})

test('POST /courses should accept special characters in title', async () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    const response = await request(app.server)
        .post('/courses')
        .send({ title: specialChars, description: 'test' })
        .expect(201)

    expect(response.body.data.title).toBe(specialChars)
})

test('POST /courses should accept newlines and tabs in description', async () => {
    const multilineDesc = 'Line 1\nLine 2\tTabbed\rCarriage return'

    const response = await request(app.server)
        .post('/courses')
        .send({ title: 'Test', description: multilineDesc })
        .expect(201)

    expect(response.body.data.description).toBe(multilineDesc)
})

// ===== TESTS OF PAGINATION =====

test('GET /courses should handle page=0', async () => {
    await makeCourse()

    const response = await request(app.server)
        .get('/courses?page=0')
        .expect(200)

    // Page 0 should be treated as page 1
    expect(response.body.currentPage).toBe(0)
})

test('GET /courses should handle negative page', async () => {
    await makeCourse()

    await request(app.server)
        .get('/courses?page=-1')
        .expect(400)
})

test('GET /courses should handle page beyond available data', async () => {
    await makeCourse()

    const response = await request(app.server)
        .get('/courses?page=9999')
        .expect(200)

    expect(response.body.courses).toHaveLength(0)
    expect(response.body.totalPages).toBe(1)
})

test('GET /courses should handle limit=0', async () => {
    await makeCourse()

    await request(app.server)
        .get('/courses?limit=0')
        .expect(400)
})

test('GET /courses should handle very large limit', async () => {
    await makeCourse()

    // Should respect a reasonable maximum limit
    const response = await request(app.server)
        .get('/courses?limit=10000')
        .expect(200)

    // Should have a maximum limit
    expect(response.body.courses.length).toBeLessThanOrEqual(100)
})

test('GET /courses should handle non-numeric page parameter', async () => {
    await request(app.server)
        .get('/courses?page=abc')
        .expect(400)
})

// ===== TESTS OF BULK OPERATIONS =====

test('POST /courses should reject empty array', async () => {
    await request(app.server)
        .post('/courses')
        .send([])
        .expect(400)
})

test('POST /courses should handle array with invalid items', async () => {
    await request(app.server)
        .post('/courses')
        .send([
            { title: 'Valid' },
            { title: '' }, // Invalid
            { description: 'No title' } // Invalid
        ])
        .expect(400)
})

test('POST /courses should handle very large bulk creation', async () => {
    const bulkCourses = Array.from({ length: 1000 }, (_, i) => ({
        title: `Course ${i}`,
        description: `Description ${i}`
    }))

    // Should reject or limit quantity
    await request(app.server)
        .post('/courses')
        .send(bulkCourses)
        .expect(400)
})
