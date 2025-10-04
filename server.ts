import { config } from 'dotenv'
import fastify from 'fastify'
import { fastifySwagger } from '@fastify/swagger'
//import { fastifySwaggerUi } from '@fastify/swagger-ui'
import fastifyApiReference from '@scalar/fastify-api-reference'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import { getCoursesRoute } from './src/routes/get-courses.ts'
import { getCourseByIdRoute } from './src/routes/get-courses-by-id.ts'
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
    
if (process.env.NODE_ENV === 'development') {
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
    
        // Swagger User Interface
        /*server.register(fastifySwaggerUi, {
            routePrefix: '/docs',
            uiConfig: {
                docExpansion: 'full',
                deepLinking: true
            }
        })*/
    
        // Scalar API Reference
        await server.register(fastifyApiReference, {
            routePrefix: '/docs',
            apiReference: {
                title: 'API de Cursos',
                version: '1.0.0'
            },
            configuration: {
                theme: 'kepler'
            }
        })
}

/* theme?: 'alternate' | 'default' | 'moon' | 'purple' | 'solarized' |
'bluePlanet' | 'saturn' | 'kepler' | 'mars' | 'deepSpace' | 'laserwave' | 'none' */
    
    server.setValidatorCompiler(validatorCompiler)
    server.setSerializerCompiler(serializerCompiler)

    // Used for JSON parsing
    await server.register(import('@fastify/formbody'))

    server.register(getCoursesRoute) // List all courses
    server.register(getCourseByIdRoute) // Search for a specific course by ID
    server.register(createCourseRoute) // Create a new course or multiple courses

    await server.listen({ port: 3333 }).then(() => {
        console.log('Server is running on port 3333')
    })
}

startServer().catch(console.error)