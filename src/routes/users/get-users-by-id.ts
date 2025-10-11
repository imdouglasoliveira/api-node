import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.js'
import { users } from '../../database/schema.js'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Search for a specific user by ID
export const getUsersByIdRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/users/:id', {
        schema: {
            tags: ['users'],
            summary: 'Get user by ID',
            description: 'Get a specific user by ID',
            params: z.object({
                id: z.string().regex(/^\d+$/, 'User ID must be a number'),
            }),
            response: {
                200: z.object({
                    user: z.object({
                        id: z.number(),
                        first_name: z.string(),
                        last_name: z.string(),
                        email: z.string(),
                        created_at: z.number(),
                        updated_at: z.number()
                    })
                }),
                404: z.null().describe('User not found'),
            }
        }
    }, async (request, reply) => {
        const userId = parseInt(request.params.id)
        const result = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))

        if (result.length > 0) {
            const user = result[0]

            return {
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    created_at: user.created_at.getTime(),
                    updated_at: user.updated_at.getTime()
                }
            }
        }
        return reply.status(404).send()

    })
}