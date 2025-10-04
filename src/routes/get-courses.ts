import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../database/client.js'
import { courses } from '../database/schema.js'
import { z } from 'zod'
import { sql } from 'drizzle-orm'

// Listar todos os cursos com paginação
export const getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/courses', {
        schema: {
            querystring: z.object({
                page: z.string().transform(Number).default(1),
                limit: z.string().transform(Number).default(10)
            }),
            response: {
                200: z.object({
                    courses: z.array(z.object({
                        id: z.number(),
                        title: z.string(),
                        description: z.string().nullable(),
                        created_at: z.number(),
                        updated_at: z.number()
                    })),
                    currentPage: z.number(),
                    perPage: z.number(),
                    totalItems: z.number(),
                    totalPages: z.number()
                })
            }
        }
    }, async (request, reply) => {
        const { page, limit } = request.query
        const offset = (page - 1) * limit

        // Obter cursos com paginação
        const result = await db.select({
            id: courses.id,
            title: courses.title,
            description: courses.description,
            created_at: courses.created_at,
            updated_at: courses.updated_at
        })
        .from(courses)
        .limit(limit)
        .offset(offset)

        // Obter contagem total de cursos
        const totalItemsResult = await db.select({ count: sql<number>`count(*)` }).from(courses)
        const totalItems = totalItemsResult[0].count

        const totalPages = Math.ceil(totalItems / limit)

        return reply.status(200).send({
            courses: result.map(course => ({
                id: course.id,
                title: course.title,
                description: course.description,
                created_at: course.created_at.getTime(),
                updated_at: course.updated_at.getTime()
            })),
            currentPage: page,
            perPage: limit,
            totalItems,
            totalPages
        })
    })
}