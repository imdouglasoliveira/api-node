import fastify from 'fastify'
import crypto from 'node:crypto'

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

// Definir interfaces
interface Course {
    id: string
    name: string
}

interface CreateCourseRequest {
    title: string
}

// Gerar UUIDs sem repetir o mesmo UUID
const generateId = () => {
    return crypto.randomUUID()
}

const courses: Course[] = [
    // id: generateId(), name: 'Curso de Node.js' },
    { id: '1', name: 'Curso de Node.js' },
    { id: '2', name: 'Curso de React' },
    { id: '3', name: 'Curso de Python' },
    { id: '4', name: 'Curso de Java' },
    { id: '5', name: 'Curso de C#' },
    { id: '6', name: 'Curso de PHP' },
    { id: '7', name: 'Curso de Ruby' },
    { id: '8', name: 'Curso de Go' },
    { id: '9', name: 'Curso de Kotlin' },
    { id: '10', name: 'Curso de Scala' },
]

server.get('/courses', (request, reply) => {
    return { courses, page: 1, total: courses.length }
})

server.get<{ Params: { id: string } }>('/courses/:id', (request, reply) => {
    const courseId = request.params.id

    const course = courses.find(course => course.id === courseId)

    if (course) {
        return reply.status(200).send({ course })
    } else {
        return reply.status(404).send({ error: 'Curso não encontrado' })
    }
})

server.post<{ Body: CreateCourseRequest }>('/courses', async (request, reply) => {
    // Pegar o nome do curso do corpo da requisição
    const courseName = request.body.title
    // Gerar um id do tipo UUID aleatório
    const courseId = generateId()

    const courseReturn: Course = { id: courseId, name: courseName }

    if (!courseName) {
        return reply.status(400).send({ error: 'Nome do curso é obrigatório' })
    } else {
        courses.push({ id: courseId, name: courseName })
        return reply.status(201).send(courseReturn)
    }

})

server.listen({ port: 3333 }).then(() => {
    console.log('Server is running on port 3333')
})