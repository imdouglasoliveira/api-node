import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../database/client.js'
import { courses } from '../database/schema.js'
import { z } from 'zod'

// Criar UM novo curso ou VÁRIOS
export const createCourseRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/courses', {
        schema: {
            tags: ['courses'],
            summary: 'Criar um novo curso ou vários cursos',
            description: 'Cria um novo curso ou vários cursos na base de dados',
            body: z.union([
                // Para um único curso
                z.object({
                    title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo')
                }),
                // Para múltiplos cursos
                z.array(z.object({
                    title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo')
                })).min(1, 'Array não pode estar vazio').max(50, 'Máximo 50 cursos por vez')
            ]),
            response: {
                201: z.union([
                    z.object({
                        success: z.boolean(),
                        data: z.object({
                            courseId: z.number()
                        }).describe('Curso criado com sucesso - único curso')
                    }),
                    z.object({
                        success: z.boolean(),
                        data: z.object({
                            courses: z.array(z.object({
                                id: z.number(),
                                title: z.string()
                            })),
                            total: z.number()
                        }).describe('Cursos criados com sucesso - múltiplos cursos')
                    })
                ])
            }
        }
    }, async (request, reply) => {
        const body = request.body

        if (Array.isArray(body)) {
            try {
                const coursesToInsert = body.map(course => ({
                    title: course.title,
                    description: null
                }))

                // Inserir todos os cursos de uma vez
                const result = await db
                    .insert(courses)
                    .values(coursesToInsert)
                    .returning()

                // Retornar resposta padronizada
                return reply.status(201).send({
                    success: true,
                    data: {
                        courses: result.map((course) => ({
                            id: course.id,
                            title: course.title
                        })),
                        total: result.length
                    }
                })
            } catch (error) {
                server.log.error('Erro ao criar cursos:', error) // Uso do logger do Fastify
                return reply.status(500).send({ error: 'Erro ao criar cursos' })
            }

        } else {
            // Criar um único curso
            const result = await db
                .insert(courses)
                .values({
                    title: body.title,
                    description: null
                })
                .returning()

            return reply.status(201).send({
                success: true,
                data: { courseId: result[0].id }
            })
        }
    })
}