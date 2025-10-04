import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../database/client.js'
import { courses } from '../database/schema.js'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Search for a specific course by ID
export const getCoursesByIdRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/courses/:id', {
        schema: {
            tags: ['courses'],
            summary: 'Search for a specific course by ID',
            description: 'Searches for a specific course by ID in the database',
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
}