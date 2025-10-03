import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../database/client.js'
import { courses } from '../database/schema.js'

// Listar todos os cursos
export const getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/courses', async (request, reply) => {
        const result = await db.select({
            id: courses.id,
            title: courses.title,
            created_at: courses.created_at,
            updated_at: courses.updated_at
        }).from(courses)
        return reply.status(200).send({ result, total: result.length })
    })
}