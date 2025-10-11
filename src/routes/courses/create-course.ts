import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.ts'
import { courses } from '../../database/schema.ts'
import { z } from 'zod'

// Create a new course or multiple courses
export const createCourseRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/courses', {
        schema: {
            tags: ['courses'],
            summary: 'Create a new course or multiple courses',
            description: 'Creates a new course or multiple courses in the database',
            body: z.union([
                // For a single course
                z.object({
                    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
                    description: z.string().nullable().optional()
                }),
                // For multiple courses
                z.array(z.object({
                    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
                    description: z.string().nullable().optional()
                })).min(1, 'Array cannot be empty').max(50, 'Maximum 50 courses at once')
            ]),
            response: {
                201: z.union([
                    z.object({
                        success: z.boolean(),
                        data: z.object({
                            id: z.number(),
                            title: z.string(),
                            description: z.string().nullable(),
                            created_at: z.number(),
                            updated_at: z.number()
                        }).describe('Course created successfully - single course')
                    }),
                    z.object({
                        success: z.boolean(),
                        data: z.object({
                            courses: z.array(z.object({
                                id: z.number(),
                                title: z.string(),
                                description: z.string().nullable(),
                                created_at: z.number(),
                                updated_at: z.number()
                            })),
                            total: z.number()
                        }).describe('Courses created successfully - multiple courses')
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
                const coursesToInsert = body.map(course => ({
                    title: course.title,
                    description: course.description || null
                }))

                // Insert all courses at once
                const result = await db
                    .insert(courses)
                    .values(coursesToInsert)
                    .returning()

                // Return standardized response
                return reply.status(201).send({
                    success: true,
                    data: {
                        courses: result.map((course) => ({
                            id: course.id,
                            title: course.title,
                            description: course.description,
                            created_at: course.created_at.getTime(),
                            updated_at: course.updated_at.getTime()
                        })),
                        total: result.length
                    }
                })
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                server.log.error(`Error creating courses: ${errorMessage}`);
                return reply.status(500).send({ error: 'Error creating courses' })
            }

        } else {
            try {
                // Create a single course
                const result = await db
                    .insert(courses)
                    .values({
                        title: body.title,
                        description: body.description || null
                    })
                    .returning()

                return reply.status(201).send({
                    success: true,
                    data: {
                        id: result[0].id,
                        title: result[0].title,
                        description: result[0].description,
                        created_at: result[0].created_at.getTime(),
                        updated_at: result[0].updated_at.getTime()
                    }
                })
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                server.log.error(`Error creating course: ${errorMessage}`);
                return reply.status(500).send({ error: 'Error creating course' })
            }
        }
    })
}