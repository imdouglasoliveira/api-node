import { config } from 'dotenv'
import fastify from 'fastify'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import { getCoursesRoute } from './src/routes/get-courses.ts'
import { getCoursesByIdRoute } from './src/routes/get-courses-by-id.ts'
import { createCourseRoute } from './src/routes/create-course.ts'


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
    }).withTypeProvider<ZodTypeProvider>() 
    
    // Add Fastify Swagger
    server.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'API de Cursos',
                version: '1.0.0'
            }
        },
        transform: jsonSchemaTransform,
    })

    // Interface de usuário do Swagger
    server.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: true
        }
    })
    
    server.setValidatorCompiler(validatorCompiler)
    server.setSerializerCompiler(serializerCompiler)

    // Usado para parsing de JSON
    await server.register(import('@fastify/formbody'))

    server.register(getCoursesRoute) // Listar todos os cursos
    server.register(getCoursesByIdRoute) // Buscar um curso específico pelo ID
    server.register(createCourseRoute) // Criar um novo curso  ou Vários

    await server.listen({ port: 3333 }).then(() => {
        console.log('Server is running on port 3333')
    })
}

startServer().catch(console.error)