import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.js'
import { enrollments, users, courses } from '../../database/schema.js'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

// Search for a specific enrollment by user_id and course_id
export const getEnrollmentByIdsRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/enrollments/:user_id/:course_id', {
        schema: {
            tags: ['enrollments'],
            summary: 'Get enrollment by user_id and course_id',
            description: 'Get a specific enrollment by user_id and course_id',
            params: z.object({
                user_id: z.string().regex(/^\d+$/, 'ID do usuário deve ser um número'),
                course_id: z.string().regex(/^\d+$/, 'ID do curso deve ser um número')
            }),
            response: {
                200: z.object({
                    enrollment: z.object({
                        user_id: z.number(),
                        course_id: z.number(),
                        user_name: z.string(),
                        course_title: z.string(),
                        created_at: z.number(),
                        updated_at: z.number()
                    })
                }),
                404: z.null().describe('Enrollment not found'),
            }
        }
    }, async (request, reply) => {
        const userId = parseInt(request.params.user_id)
        const courseId = parseInt(request.params.course_id)

        const result = await db
            .select({
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
            .where(and(
                eq(enrollments.user_id, userId),
                eq(enrollments.course_id, courseId)
            ))

        if (result.length > 0) {
            const enrollment = result[0]

            return {
                enrollment: {
                    user_id: enrollment.user_id,
                    course_id: enrollment.course_id,
                    user_name: `${enrollment.user_first_name} ${enrollment.user_last_name}`,
                    course_title: enrollment.course_title,
                    created_at: enrollment.created_at.getTime(),
                    updated_at: enrollment.updated_at.getTime()
                }
            }
        }
        return reply.status(404).send()
    })
}
