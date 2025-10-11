import { db } from '../../database/client.ts'
import { users, enrollments } from '../../database/schema.ts'
import { generateUserMock } from '../utils/mocks/user.mock.ts'
import { makeCourse } from './make-course.ts'

// Mock interface for user
interface MakeUserOptions {
    first_name?: string
    last_name?: string
    email?: string
}

// Mock interface for user with enrollments
interface MakeUserWithEnrollmentsOptions extends MakeUserOptions {
    enrollmentsCount?: number
    courseIds?: number[]
}

// Generate a mock user
export async function makeUser(overrides?: MakeUserOptions) {
    // Generate a mock user
    const mockUser = generateUserMock()

    // Generate user data
    const userData = {
        first_name: overrides?.first_name ?? mockUser.first_name,
        last_name: overrides?.last_name ?? mockUser.last_name,
        email: overrides?.email ?? mockUser.email
    }

    const [user] = await db
        .insert(users)
        .values(userData)
        .returning()

    return user
}

/**
 * Create a user with N enrollments
 * @example
 * // Create user with 3 enrollments (creates 3 courses automatically)
 * const user = await makeUserWithEnrollments({ enrollmentsCount: 3 })
 *
 * // Create user enrolled in specific courses
 * const courses = [await makeCourse(), await makeCourse()]
 * const user = await makeUserWithEnrollments({
 *   courseIds: courses.map(c => c.id)
 * })
 */
export async function makeUserWithEnrollments(options?: MakeUserWithEnrollmentsOptions) {
    const { enrollmentsCount = 0, courseIds, ...userOptions } = options || {}

    // Create user
    const user = await makeUser(userOptions)

    // Create enrollments
    if (courseIds) {
        // Use specific courses
        await db.insert(enrollments).values(
            courseIds.map(courseId => ({
                user_id: user.id,
                course_id: courseId
            }))
        )
    } else if (enrollmentsCount > 0) {
        // Create new courses
        const courses = await Promise.all(
            Array.from({ length: enrollmentsCount }, () => makeCourse())
        )
        await db.insert(enrollments).values(
            courses.map(course => ({
                user_id: user.id,
                course_id: course.id
            }))
        )
    }

    return user
}
