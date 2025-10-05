import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.js'
import { courses } from '../../database/schema.js'
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
                    title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
                    description: z.string().nullable().optional()
                }),
                // For multiple courses
                z.array(z.object({
                    title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
                    description: z.string().nullable().optional()
                })).min(1, 'Array não pode estar vazio').max(50, 'Máximo 50 cursos por vez')
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
                        }).describe('Curso criado com sucesso - único curso')
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
                        }).describe('Cursos criados com sucesso - múltiplos cursos')
                    })
                ]),
                500: z.object({
                    error: z.string()
                }).describe('Erro interno do servidor')
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
                server.log.error(`Erro ao criar cursos: ${errorMessage}`);
                return reply.status(500).send({ error: 'Erro ao criar cursos' })
            }

        } else {
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
        }
    })
}