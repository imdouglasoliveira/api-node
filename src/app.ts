import { config } from 'dotenv'
import fastify, { type FastifyInstance } from 'fastify'
import { fastifySwagger } from '@fastify/swagger'
import fastifyApiReference from '@scalar/fastify-api-reference'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
// Get courses
import { getCoursesRoute } from './routes/courses/get-courses.ts'
// Get course by id
import { getCourseByIdRoute } from './routes/courses/get-courses-by-id.ts'
// Create course
import { createCourseRoute } from './routes/courses/create-course.ts'
// Get users by id
import { getUsersByIdRoute } from './routes/users/get-users-by-id.ts'
// Get users
import { getUsersRoute } from './routes/users/get-users.ts'
// Create user
import { createUserRoute } from './routes/users/create-user.ts'
// Get enrollments
import { getEnrollmentsRoute } from './routes/enrollments/get-enrollments.ts'
// Get enrollment by ids
import { getEnrollmentByIdsRoute } from './routes/enrollments/get-enrollment-by-ids.ts'
// Create enrollment
import { createEnrollmentRoute } from './routes/enrollments/create-enrollment.ts'

config()

async function startServer(): Promise<FastifyInstance> {
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
        await server.register(fastifySwagger, {
            openapi: {
                info: {
                    title: 'Course API',
                    version: '1.0.2'
                }
            },
            transform: jsonSchemaTransform,
        })

        // Scalar API Reference
        /* theme?: 'alternate' | 'default' | 'moon' | 'purple' | 'solarized' |
        'bluePlanet' | 'saturn' | 'kepler' | 'mars' | 'deepSpace' | 'laserwave' | 'none' */
        await server.register(fastifyApiReference, {
            routePrefix: '/docs',
            configuration: {
                theme: 'kepler'
            }
        })
    }

    server.setValidatorCompiler(validatorCompiler)
    server.setSerializerCompiler(serializerCompiler)

    // Used for JSON parsing
    await server.register(import('@fastify/formbody'))

    // Routes Courses
    server.register(getCoursesRoute) // List all courses
    server.register(getCourseByIdRoute) // Search for a specific course by ID
    server.register(createCourseRoute) // Create a new course or multiple courses

    // Routes Users
    server.register(getUsersByIdRoute) // Search for a specific user by ID
    server.register(getUsersRoute) // List all users
    server.register(createUserRoute) // Create a new user or multiple users

    // Routes Enrollments
    server.register(getEnrollmentsRoute) // List all enrollments
    server.register(getEnrollmentByIdsRoute) // Search for a specific enrollment by user_id and course_id
    server.register(createEnrollmentRoute) // Create a new enrollment or multiple enrollments
    
    // Return the server instance
    return server
}

export { startServer }