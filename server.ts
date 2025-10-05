import { config } from 'dotenv'
import fastify from 'fastify'
import { fastifySwagger } from '@fastify/swagger'
import fastifyApiReference from '@scalar/fastify-api-reference'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
// Get courses
import { getCoursesRoute } from './src/routes/courses/get-courses.ts'
// Get course by id
import { getCourseByIdRoute } from './src/routes/courses/get-courses-by-id.ts'
// Create course
import { createCourseRoute } from './src/routes/courses/create-course.ts'
// Get users by id
import { getUsersByIdRoute } from './src/routes/users/get-users-by-id.ts'
// Get users
import { getUsersRoute } from './src/routes/users/get-users.ts'
// Create user
import { createUserRoute } from './src/routes/users/create-user.ts'
// Get enrollments
import { getEnrollmentsRoute } from './src/routes/enrollments/get-enrollments.ts'
// Get enrollment by ids
import { getEnrollmentByIdsRoute } from './src/routes/enrollments/get-enrollment-by-ids.ts'
// Create enrollment
import { createEnrollmentRoute } from './src/routes/enrollments/create-enrollment.ts'

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

    await server.listen({ port: 3333 }).then(() => {
        console.log('Server is running on port 3333')
    })
}

startServer().catch(console.error)