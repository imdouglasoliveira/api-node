import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.js'
import { enrollments, users, courses } from '../../database/schema.js'
import { sql, eq, and, SQL } from 'drizzle-orm'
import { z } from 'zod'

// List all enrollments with pagination and filters
export const getEnrollmentsRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/enrollments', {
        schema: {
            tags: ['enrollments'],
            summary: 'List all enrollments with pagination',
            description: 'Lists all enrollments with pagination and optional filters',
            querystring: z.object({
                page: z.coerce.number().optional().default(1),
                limit: z.coerce.number().optional().default(10),
                user_id: z.coerce.number().optional(),
                course_id: z.coerce.number().optional()
            }),
            response: {
                200: z.object({
                    enrollments: z.array(z.object({
                        user_id: z.number(),
                        course_id: z.number(),
                        user_name: z.string(),
                        course_title: z.string(),
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
        const { page, limit, user_id, course_id } = request.query
        const offset = (page - 1) * limit

        const conditions: SQL[] = []

        if (user_id) {
            conditions.push(eq(enrollments.user_id, user_id))
        }

        if (course_id) {
            conditions.push(eq(enrollments.course_id, course_id))
        }

        // Get enrollments with joins
        const [result, totalItemsResult] = await Promise.all([
            db.select({
                user_id: enrollments.user_id,
                course_id: enrollments.course_id,
                user_first_name: users.first_name,
                user_last_name: users.last_name,
                course_title: courses.title,
                created_at: enrollments.created_at,
                updated_at: enrollments.updated_at
            })
            .from(enrollments)
            .innerJoin(users, eq(enrollments.user_id, users.id))
            .innerJoin(courses, eq(enrollments.course_id, courses.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .limit(limit)
            .offset(offset),

            // Get total count
            db.select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
        ])

        const totalItems = totalItemsResult[0].count
        const totalPages = Math.ceil(totalItems / limit)

        return reply.status(200).send({
            enrollments: result.map(enrollment => ({
                user_id: enrollment.user_id,
                course_id: enrollment.course_id,
                user_name: `${enrollment.user_first_name} ${enrollment.user_last_name}`,
                course_title: enrollment.course_title,
                created_at: enrollment.created_at.getTime(),
                updated_at: enrollment.updated_at.getTime()
            })),
            currentPage: page,
            perPage: limit,
            totalItems,
            totalPages
        })
    })
}
