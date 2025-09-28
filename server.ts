import { config } from 'dotenv';
import { eq } from 'drizzle-orm'
import fastify from 'fastify'
import { db } from './src/database/client'
import { courses } from './src/database/schema'

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

    // Registrar plugin para parsing de JSON
    await server.register(import('@fastify/formbody'))

// Definir interfaces
interface Course {
    id: string
    title: string
    updated_at: string
}

interface CreateCourseRequest {
    title: string
}

// GET /courses - Listar todos os cursos
server.get('/courses', async (request, reply) => {
    const result = await db.select({
        id: courses.id,
        title: courses.title,
        updated_at: courses.updated_at
    }).from(courses)
    
    return reply.status(200).send({ result, total: result.length })
})

// GET /courses/:id - Buscar um curso específico
server.get('/courses/:id', async (request, reply) => {
    const courseId = request.params.id
    const result = await db.select({
        id: courses.id,
        title: courses.title,
        updated_at: courses.updated_at
    })
    .from(courses)
    .where(eq(courses.id, courseId))

    if (result.length > 0) {
        return { course: result[0] }
    }

    return reply.status(404).send()
})

// POST /courses - Criar um novo curso
server.post<{ Body: CreateCourseRequest }>('/courses', async (request, reply) => {
    // Pegar o nome do curso do corpo da requisição
    const courseTitle = request.body.title
    // Verificar se o nome do curso foi informado
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
})

    server.listen({ port: 3333 }).then(() => {
        console.log('Server is running on port 3333')
    })
}

startServer()