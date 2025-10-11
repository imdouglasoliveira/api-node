import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startServer } from '../../../app.ts'
import type { FastifyInstance } from 'fastify'
import { makeCourseWithEnrollments } from '../../../tests/factories/make-course.ts'
import { cleanDatabase } from '../../../tests/utils/database.ts'
import { seedFullCatalog, seedPopularCourse } from '../../../tests/utils/test-scenarios.ts'

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

test('GET /courses should respond within 200ms with empty database', async () => {
    const start = Date.now()

    await request(app.server)
        .get('/courses')
        .expect(200)

    const duration = Date.now() - start

    expect(duration).toBeLessThan(200)
})

test('GET /courses should respond within 500ms with 100 courses', async () => {
    // Create 100 courses
    await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
            makeCourseWithEnrollments({
                title: `Course ${i}`,
                enrollmentsCount: 5
            })
        )
    )

    const start = Date.now()

    const response = await request(app.server)
        .get('/courses')
        .expect(200)

    const duration = Date.now() - start

    expect(response.body.courses).toHaveLength(10) // Default limit
    expect(response.body.totalItems).toBe(100)
    expect(duration).toBeLessThan(500)
})

test('GET /courses should handle pagination efficiently', async () => {
    await seedFullCatalog()

    const durations: number[] = []

    // Testar múltiplas páginas
    for (let page = 1; page <= 3; page++) {
        const start = Date.now()

        await request(app.server)
            .get(`/courses?page=${page}&limit=5`)
            .expect(200)

        durations.push(Date.now() - start)
    }

    // Todas as páginas devem responder em tempo similar (< 300ms)
    durations.forEach(duration => {
        expect(duration).toBeLessThan(300)
    })
})

test('GET /courses with search should be performant', async () => {
    await seedFullCatalog()

    const start = Date.now()

    await request(app.server)
        .get('/courses?search=javascript')
        .expect(200)

    const duration = Date.now() - start

    expect(duration).toBeLessThan(300)
})

test('GET /courses/:id should respond within 100ms', async () => {
    const { course } = await seedPopularCourse(100)

    const start = Date.now()

    await request(app.server)
        .get(`/courses/${course.id}`)
        .expect(200)

    const duration = Date.now() - start

    expect(duration).toBeLessThan(100)
})

test('POST /courses should handle bulk creation efficiently', async () => {
    const bulkCourses = Array.from({ length: 50 }, (_, i) => ({
        title: `Bulk Course ${i}`,
        description: `Description ${i}`
    }))

    const start = Date.now()

    await request(app.server)
        .post('/courses')
        .send(bulkCourses)
        .expect(201)

    const duration = Date.now() - start

    // 50 courses should be created in less than 2 seconds
    expect(duration).toBeLessThan(2000)
})

test('Multiple concurrent requests should be handled efficiently', async () => {
    await seedFullCatalog()

    const start = Date.now()

    // 10 requisições simultâneas
    await Promise.all(
        Array.from({ length: 10 }, () =>
            request(app.server)
                .get('/courses')
                .expect(200)
        )
    )

    const duration = Date.now() - start

    // 10 requisições concorrentes devem completar em menos de 1 segundo
    expect(duration).toBeLessThan(1000)
})
