import { db } from '../../database/client.ts'
import { courses, enrollments } from '../../database/schema.ts'
import { generateCourseMock } from '../utils/mocks/course.mock.ts'
import { makeUser } from './make-user.ts'

// Mock interface for course
interface MakeCourseOptions {
    title?: string
    description?: string | null
}

// Mock interface for course with enrollments
interface MakeCourseWithEnrollmentsOptions extends MakeCourseOptions {
    enrollmentsCount?: number
    userIds?: number[]
}

// Generate a mock course
export async function makeCourse(overrides?: MakeCourseOptions) {
    // Generate a mock course
    const mockCourse = generateCourseMock()

    // Generate course data
    const courseData = {
        title: overrides?.title ?? mockCourse.title,
        description: overrides?.description !== undefined ? overrides.description : mockCourse.description
    }

    // Insert course data
    const [course] = await db
        .insert(courses)
        .values(courseData)
        .returning()

    return course
}

/**
 * Create a course with N enrollments
 * @example
 * // Create course with 5 enrollments (creates 5 users automatically)
 * const course = await makeCourseWithEnrollments({ enrollmentsCount: 5 })
 *
 * // Create course with enrollments of specific users
 * const users = [await makeUser(), await makeUser()]
 * const course = await makeCourseWithEnrollments({
 *   userIds: users.map(u => u.id)
 * })
 */
export async function makeCourseWithEnrollments(options?: MakeCourseWithEnrollmentsOptions) {
    const { enrollmentsCount = 0, userIds, ...courseOptions } = options || {}

    // Create course
    const course = await makeCourse(courseOptions)

    // Create enrollments
    if (userIds) {
        // Use specific users
        await db.insert(enrollments).values(
            userIds.map(userId => ({
                user_id: userId,
                course_id: course.id
            }))
        )
    } else if (enrollmentsCount > 0) {
        // Create new users
        const users = await Promise.all(
            Array.from({ length: enrollmentsCount }, () => makeUser())
        )
        await db.insert(enrollments).values(
            users.map(user => ({
                user_id: user.id,
                course_id: course.id
            }))
        )
    }

    return course
}