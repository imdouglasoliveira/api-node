import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.js'
import { enrollments } from '../../database/schema.js'
import { z } from 'zod'

// Create a new enrollment or multiple enrollments
export const createEnrollmentRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/enrollments', {
        schema: {
            tags: ['enrollments'],
            summary: 'Create a new enrollment or multiple enrollments',
            description: 'Creates a new enrollment or multiple enrollments in the database',
            body: z.union([
                // For a single enrollment
                z.object({
                    user_id: z.number().int().positive('User ID must be positive'),
                    course_id: z.number().int().positive('Course ID must be positive')
                }),
                // For multiple enrollments
                z.array(z.object({
                    user_id: z.number().int().positive('User ID must be positive'),
                    course_id: z.number().int().positive('Course ID must be positive')
                })).min(1, 'Array cannot be empty').max(100, 'Maximum 100 enrollments at once')
            ]),
            response: {
                201: z.union([
                    z.object({
                        success: z.boolean(),
                        data: z.object({
                            user_id: z.number(),
                            course_id: z.number(),
                            created_at: z.number(),
                            updated_at: z.number()
                        }).describe('Enrollment created successfully - single enrollment')
                    }),
                    z.object({
                        success: z.boolean(),
                        data: z.object({
                            enrollments: z.array(z.object({
                                user_id: z.number(),
                                course_id: z.number(),
                                created_at: z.number(),
                                updated_at: z.number()
                            })),
                            total: z.number()
                        }).describe('Enrollments created successfully - multiple enrollments')
                    })
                ]),
                500: z.object({
                    error: z.string()
                }).describe('Internal server error')
            }
        }
    }, async (request, reply) => {
        const body = request.body

        if (Array.isArray(body)) {
            try {
                const enrollmentsToInsert = body.map(enrollment => ({
                    user_id: enrollment.user_id,
                    course_id: enrollment.course_id
                }))

                // Insert all enrollments at once
                const result = await db
                    .insert(enrollments)
                    .values(enrollmentsToInsert)
                    .returning()

                // Return standardized response
                return reply.status(201).send({
                    success: true,
                    data: {
                        enrollments: result.map((enrollment) => ({
                            user_id: enrollment.user_id,
                            course_id: enrollment.course_id,
                            created_at: enrollment.created_at.getTime(),
                            updated_at: enrollment.updated_at.getTime()
                        })),
                        total: result.length
                    }
                })
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                server.log.error(`Error creating enrollments: ${errorMessage}`);
                return reply.status(500).send({ error: 'Error creating enrollments' })
            }

        } else {
            // Create a single enrollment
            const result = await db
                .insert(enrollments)
                .values({
                    user_id: body.user_id,
                    course_id: body.course_id
                })
                .returning()

            return reply.status(201).send({
                success: true,
                data: {
                    user_id: result[0].user_id,
                    course_id: result[0].course_id,
                    created_at: result[0].created_at.getTime(),
                    updated_at: result[0].updated_at.getTime()
                }
            })
        }
    })
}
