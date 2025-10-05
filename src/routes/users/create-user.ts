import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.js'
import { users } from '../../database/schema.js'
import { z } from 'zod'

// Create a new user or multiple users
export const createUserRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/users', {
        schema: {
            tags: ['users'],
            summary: 'Create a new user or multiple users',
            description: 'Creates a new user or multiple users in the database',
            body: z.union([
                // For a single user
                z.object({
                    first_name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
                    last_name: z.string().min(1, 'Sobrenome é obrigatório').max(100, 'Sobrenome muito longo'),
                    email: z.string().email('Email inválido').min(1, 'Email é obrigatório').max(100, 'Email muito longo')
                }),
                // For multiple users
                z.array(z.object({
                    first_name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
                    last_name: z.string().min(1, 'Sobrenome é obrigatório').max(100, 'Sobrenome muito longo'),
                    email: z.string().email('Email inválido').min(1, 'Email é obrigatório').max(100, 'Email muito longo')
                })).min(1, 'Array não pode estar vazio').max(50, 'Máximo 50 usuários por vez')
            ]),
            response: {
                201: z.union([
                    z.object({
                        success: z.boolean(),
                        data: z.object({
                            id: z.number(),
                            first_name: z.string(),
                            last_name: z.string(),
                            email: z.string(),
                            created_at: z.number(),
                            updated_at: z.number()
                        }).describe('Usuário criado com sucesso - único usuário')
                    }),
                    z.object({
                        success: z.boolean(),
                        data: z.object({
                            users: z.array(z.object({
                                id: z.number(),
                                first_name: z.string(),
                                last_name: z.string(),
                                email: z.string(),
                                created_at: z.number(),
                                updated_at: z.number()
                            })),
                            total: z.number()
                        }).describe('Usuários criados com sucesso - múltiplos usuários')
                    })
                ]),
                500: z.object({
                    error: z.string()
                }).describe('Erro interno do servidor')
            }
        }
    }, async (request, reply) => {
        const body = request.body

        if (Array.isArray(body)) {
            try {
                const usersToInsert = body.map(user => ({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email
                }))

                // Insert all users at once
                const result = await db
                    .insert(users)
                    .values(usersToInsert)
                    .returning()

                // Return standardized response
                return reply.status(201).send({
                    success: true,
                    data: {
                        users: result.map((user) => ({
                            id: user.id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email: user.email,
                            created_at: user.created_at.getTime(),
                            updated_at: user.updated_at.getTime()
                        })),
                        total: result.length
                    }
                })
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                server.log.error(`Erro ao criar usuários: ${errorMessage}`);
                return reply.status(500).send({ error: 'Erro ao criar usuários' })
            }

        } else {
            // Create a single user
            const result = await db
                .insert(users)
                .values({
                    first_name: body.first_name,
                    last_name: body.last_name,
                    email: body.email
                })
                .returning()

            return reply.status(201).send({
                success: true,
                data: {
                    id: result[0].id,
                    first_name: result[0].first_name,
                    last_name: result[0].last_name,
                    email: result[0].email,
                    created_at: result[0].created_at.getTime(),
                    updated_at: result[0].updated_at.getTime()
                }
            })
        }
    })
}