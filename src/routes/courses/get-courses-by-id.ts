import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.js'
import { courses } from '../../database/schema.js'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Search for a specific course by ID
export const getCourseByIdRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/courses/:id', {
      schema: {
        tags: ['courses'],
        summary: 'Get course by ID',
        description: 'Get a specific course by ID',
        params: z.object({
          id: z.string().regex(/^\d+$/, 'ID do curso deve ser um número'),
        }),
        response: {
          200: z.object({
            course: z.object({
              id: z.number(),
              title: z.string(),
              description: z.string().nullable(),
              created_at: z.number(),
              updated_at: z.number()
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
        const course = result[0]

        return { 
          course: {
            id: course.id,
            title: course.title,
            description: course.description,
            created_at: course.created_at.getTime(),
            updated_at: course.updated_at.getTime()
          }
         }
      }
    
      return reply.status(404).send()
    })
  }