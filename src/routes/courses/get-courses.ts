import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.ts'
import { courses, enrollments } from '../../database/schema.ts'
import { asc, type SQL, and, eq, count, sql, like } from 'drizzle-orm'
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
                orderby: z.string().optional(),
                orderBy: z.string().optional()
            }).transform((data) => ({
                page: data.page,
                limit: data.limit,
                search: data.search,
                orderBy: (data.orderby || data.orderBy || 'id').toLowerCase() as 'title' | 'id'
            })),
            response: {
                200: z.object({
                    courses: z.array(z.object({
                        id: z.number(),
                        title: z.string(),
                        description: z.string().nullable(),
                        enrollments: z.number(),
                        created_at: z.number(),
                        updated_at: z.number()
                    })),
                    totalEnrollments: z.number(),
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
            conditions.push(
                sql`lower(${courses.title}) LIKE ${`%${search.toLowerCase()}%`}`
            )
        }

        // Get courses with pagination
        const [result, totalItemsResult, totalCoursesEnrollments] = await Promise.all([
            db.select({
                id: courses.id,
                title: courses.title,
                description: courses.description,
                enrollments: count(enrollments.course_id),
                created_at: courses.created_at,
                updated_at: courses.updated_at
            })
            .from(courses)
            .leftJoin(enrollments, eq(enrollments.course_id, courses.id))
            .where(and(...conditions))
            .groupBy(courses.id)
            .orderBy(asc(courses[orderBy]))
            .limit(limit)
            .offset(offset),
          db.$count(courses, and(...conditions)),
          db.$count(enrollments)
        ])

        const totalItems = totalItemsResult
        const totalPages = Math.ceil(totalItems / limit)

        return reply.status(200).send({
            courses: result.map(course => ({
                id: course.id,
                title: course.title,
                description: course.description,
                enrollments: course.enrollments,
                created_at: course.created_at.getTime(),
                updated_at: course.updated_at.getTime()
            })),
            totalEnrollments: totalCoursesEnrollments,
            currentPage: page,
            perPage: limit,
            totalItems,
            totalPages
        })
    })
}