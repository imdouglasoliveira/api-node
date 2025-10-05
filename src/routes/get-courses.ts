import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../database/client.js'
import { courses } from '../database/schema.js'
import { sql, like, asc, desc, and } from 'drizzle-orm'
import { z } from 'zod'


// List all courses with pagination
// Search params: page, limit, search, orderBy
export const getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/courses', {
        schema: {
            tags: ['courses'],
            summary: 'List all courses with pagination',
            description: 'Lists all courses with pagination in the database',
            querystring: z.object({
                page: z.coerce.number().optional().default(1),
                limit: z.coerce.number().optional().default(10),
                search: z.string().optional(),
                orderBy: z.enum(['title','id']).optional().default('id')
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
        const { page, limit, search, orderBy } = request.query
        const offset = (page - 1) * limit

        const conditions: SQL[] = []

        if (search) {
            conditions.push(like(sql`lower(${courses.title})`, `%${search.toLowerCase()}%`))
        }

        // Get courses with pagination
        const [result, totalItemsResult] = await Promise.all([
            db.select({
                id: courses.id,
                title: courses.title,
                description: courses.description,
                created_at: courses.created_at,
                updated_at: courses.updated_at
            })
            .from(courses)
            .orderBy(asc(courses[orderBy]))
            .where(and(...conditions))
            .limit(limit)
            .offset(offset),

            // Get total count of courses
            db.select({ count: sql<number>`count(*)` })
            .from(courses)
            .where(and(...conditions))
        ])

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