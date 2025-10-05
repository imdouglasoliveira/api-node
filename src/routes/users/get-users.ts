import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.js'
import { users } from '../../database/schema.js'
import { sql, like, asc, desc, and, SQL } from 'drizzle-orm'
import { z } from 'zod'

// List all users with pagination
// Search params: page, limit, search, orderBy
export const getUsersRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/users', {
        schema: {
            tags: ['users'],
            summary: 'List all users with pagination',
            description: 'Lists all users with pagination in the database',
            querystring: z.object({
                page: z.coerce.number().optional().default(1),
                limit: z.coerce.number().optional().default(10),
                search: z.string().optional(),
                orderby: z.string().optional(),
                orderBy: z.string().optional()
            }).transform((data) => ({
                page: data.page,
                limit: data.limit,
                search: data.search,
                orderBy: (data.orderby || data.orderBy || 'id').toLowerCase() as 'first_name' | 'id'
            })),
            response: {
                200: z.object({
                    users: z.array(z.object({
                        id: z.number(),
                        first_name: z.string(),
                        last_name: z.string(),
                        email: z.string(),
                        created_at: z.number(),
                        updated_at: z.number()
                    })),
                    currentPage: z.number(),
                    perPage: z.number(),
                    totalItems: z.number(),
                    totalPages: z.number()
                })
            }
        }
    }, async (request, reply) => {
        const { page, limit, search, orderBy } = request.query
        const offset = (page - 1) * limit

        const conditions: SQL[] = []

        if (search) {
            conditions.push(like(sql`lower(${users.first_name})`, `%${search.toLowerCase()}%`))
        }

        // Get users with pagination
        const [result, totalItemsResult] = await Promise.all([
            db.select({
                id: users.id,
                first_name: users.first_name,
                last_name: users.last_name,
                email: users.email,
                created_at: users.created_at,
                updated_at: users.updated_at
            })
            .from(users)
            .orderBy(asc(users[orderBy]))
            .where(and(...conditions))
            .limit(limit)
            .offset(offset),

            // Get total count of users
            db.select({ count: sql<number>`count(*)` })
            .from(users)
            .where(and(...conditions))
        ])

        const totalItems = totalItemsResult[0].count
        const totalPages = Math.ceil(totalItems / limit)

        return reply.status(200).send({
            users: result.map(user => ({
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                created_at: user.created_at.getTime(),
                updated_at: user.updated_at.getTime()
            })),
            currentPage: page,
            perPage: limit,
            totalItems,
            totalPages
        })
    })
}