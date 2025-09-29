import { config } from 'dotenv'
import { eq } from 'drizzle-orm'
import fastify from 'fastify'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from './src/database/client.js'
import { courses } from './src/database/schema.js'

config()

async function startServer() {
    const server = fastify({
        logger: {
            transport: {
                target: 'pino-pretty',
                options: {
                    singleLine: true,
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                    colorize: true
                }
            }
        }
    }).withTypeProvider<ZodTypeProvider>()    
    server.setValidatorCompiler(validatorCompiler)
    server.setSerializerCompiler(serializerCompiler)

    // Usado para parsing de JSON
    await server.register(import('@fastify/formbody'))

    // GET /courses - Listar todos os cursos
    server.get('/courses', async (request, reply) => {
        const result = await db.select({
            id: courses.id,
            title: courses.title,
            created_at: courses.created_at,
            updated_at: courses.updated_at
        }).from(courses)

        return reply.status(200).send({ result, total: result.length })
    })

    // GET /courses/:id - Buscar um curso específico
    server.get('/courses/:id', {
        schema: {
            params: z.object({
                id: z.string().regex(/^\d+$/, 'ID do curso deve ser um número')
            })
        }
    }, async (request, reply) => {
        const courseId = parseInt(request.params.id)

        const result = await db.select({
            id: courses.id,
            title: courses.title,
            created_at: courses.created_at,
            updated_at: courses.updated_at
        })
            .from(courses)
            .where(eq(courses.id, courseId))

        if (result.length > 0) {
            return reply.status(200).send({ result: result[0] })
        }

        return reply.status(404).send({ error: 'Curso não encontrado' })
    })

    // POST /courses - Criar UM novo curso ou VÁRIOS
    server.post('/courses', {
        schema: {
            body: z.union([
                // Para um único curso
                z.object({
                    title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo')
                }),
                // Para múltiplos cursos
                z.array(z.object({
                    title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo')
                })).min(1, 'Array não pode estar vazio').max(50, 'Máximo 50 cursos por vez')
            ])
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
                console.error('Erro ao criar cursos:', error)
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
    await server.listen({ port: 3333 }).then(() => {
        console.log('Server is running on port 3333')
    })
}

startServer().catch(console.error)