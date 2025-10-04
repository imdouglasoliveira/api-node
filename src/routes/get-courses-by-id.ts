import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../database/client.js'
import { courses } from '../database/schema.js'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Search for a specific course by ID
export const getCourseByIdRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/courses/:id', {
      schema: {
        tags: ['courses'],
        summary: 'Get course by ID',
        params: z.object({
          id: z.string().regex(/^\d+$/, 'ID do curso deve ser um número'),
        }),
        response: {
          200: z.object({
            course: z.object({
              id: z.number(),
              title: z.string(),
              description: z.string().nullable(),
            })
          }),
          404: z.null().describe('Course not found'),
        },
      },
    }, async (request, reply) => {
      const courseId = parseInt(request.params.id)
    
      const result = await db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId))
    
      if (result.length > 0) {
        return { course: result[0] }
      }
    
      return reply.status(404).send()
    })
  }