import { config } from 'dotenv'
import { eq } from 'drizzle-orm'
import fastify from 'fastify'
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod'
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
    })
    server.setValidatorCompiler(validatorCompiler)
    server.setSerializerCompiler(serializerCompiler)

    // Registrar plugin para parsing de JSON
    await server.register(import('@fastify/formbody'))

    // Definir interfaces
    interface Course {
        id: number
        title: string
        created_at: Date
        updated_at: Date
    }

    interface CreateCourseRequest {
        title: string
    }

    interface CreateCoursesRequest extends Array<{
        title: string
    }> {}

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
    server.get('/courses/:id', async (request, reply) => {
        const courseId = parseInt((request.params as { id: string }).id)
        if (isNaN(courseId)) {
            return reply.status(400).send({ error: 'ID do curso inválido' })
        }

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

    // POST /courses - Criar um novo curso ou vários cursos
    server.post<{ Body: CreateCourseRequest } | { Body: CreateCoursesRequest }>('/courses', async (request, reply) => {
        const body = request.body

        if (Array.isArray(body)) {
            try {
                // Verificar se o array não está vazio
                if (body.length === 0) {
                    return reply.status(400).send({ error: 'Array de cursos não pode estar vazio' })
                }

                // Verificar se cada item tem title
                for (const course of body) {
                    if (!course.title) {
                        return reply.status(400).send({ error: 'Todos os cursos devem ter um título' })
                    }
                }

                // Mapear o array para o formato correto do banco
                const coursesToInsert = body.map(course => ({
                    title: course.title,
                    description: null
                }))

                // Inserir todos os cursos de uma vez
                const result = await db
                    .insert(courses)
                    .values(coursesToInsert)
                    .returning()

                // Retornar array de dos cursos criados, ID e Title
                return reply.status(201).send({
                    courses: result.map((course) => ({
                        id: course.id,
                        title: course.title
                    })),
                    total: result.length
                })
            } catch (error) {
                console.error('Erro ao criar cursos:', error)
                return reply.status(500).send({ error: 'Erro ao criar cursos' })
            }

        } else {
            // Pegar o nome do curso do corpo da requisição
            const courseTitle = (request.body as CreateCourseRequest).title
            if (!courseTitle) {
                return reply.status(400).send({ error: 'Nome do curso é obrigatório' })
            }

            // Inserir o novo curso no banco de dados
            const result = await db
                .insert(courses)
                .values({
                    title: courseTitle,
                    description: null
                })
                .returning()

            return reply.status(201).send({ courseId: result[0].id })
        }
    })
    await server.listen({ port: 3333 }).then(() => {
        console.log('Server is running on port 3333')
    })
}

startServer().catch(console.error)