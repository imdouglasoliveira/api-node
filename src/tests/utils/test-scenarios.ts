import { makeCourse, makeCourseWithEnrollments } from '../factories/make-course.ts'
import { makeUser, makeUserWithEnrollments } from '../factories/make-user.ts'
import { makeEnrollment } from '../factories/make-enrollment.ts'

/**
 * Scenarios test pre-configured to facilitate test setup
 */

/**
 * Scenario: Complete catalog
 * - 10 varied courses
 * - 5 users
 * - Each user enrolled in 2-3 courses
 */
export async function seedFullCatalog() {
    // Create courses
    const courses = await Promise.all([
        makeCourse({ title: 'JavaScript Fundamentals' }),
        makeCourse({ title: 'TypeScript Advanced' }),
        makeCourse({ title: 'Node.js Backend' }),
        makeCourse({ title: 'React Frontend' }),
        makeCourse({ title: 'Database Design' }),
        makeCourse({ title: 'API Design' }),
        makeCourse({ title: 'Testing' }),
        makeCourse({ title: 'DevOps' }),
        makeCourse({ title: 'Security' }),
        makeCourse({ title: 'Performance' }),
    ])

    // Create users with enrollments
    const users = await Promise.all([
        makeUserWithEnrollments({
            first_name: 'João',
            email: 'joao@test.com',
            courseIds: [courses[0].id, courses[1].id, courses[2].id]
        }),
        makeUserWithEnrollments({
            first_name: 'Maria',
            email: 'maria@test.com',
            courseIds: [courses[1].id, courses[3].id]
        }),
        makeUserWithEnrollments({
            first_name: 'Pedro',
            email: 'pedro@test.com',
            courseIds: [courses[4].id, courses[5].id, courses[6].id]
        }),
        makeUserWithEnrollments({
            first_name: 'Ana',
            email: 'ana@test.com',
            courseIds: [courses[7].id, courses[8].id]
        }),
        makeUserWithEnrollments({
            first_name: 'Carlos',
            email: 'carlos@test.com',
            courseIds: [courses[9].id, courses[0].id]
        }),
    ])

    return { courses, users }
}

/**
 * Scenario: Popular course
 * - 1 course with many students enrolled
 */
export async function seedPopularCourse(enrollmentsCount = 50) {
    const course = await makeCourseWithEnrollments({
        title: 'Most Popular Course',
        enrollmentsCount
    })

    return { course }
}

/**
 * Scenario: Active user
 * - 1 user enrolled in many courses
 */
export async function seedActiveUser(enrollmentsCount = 20) {
    const user = await makeUserWithEnrollments({
        first_name: 'Super Active',
        last_name: 'Student',
        email: 'active@test.com',
        enrollmentsCount
    })

    return { user }
}

/**
 * Scenario: Empty system
 * - Only structure, no data
 */
export async function seedEmptySystem() {
    return {
        courses: [],
        users: [],
        enrollments: []
    }
}

/**
 * Scenario: Minimal data
 * - 1 course, 1 user, 1 enrollment
 */
export async function seedMinimalData() {
    const course = await makeCourse({ title: 'Single Course' })
    const user = await makeUser({
        first_name: 'Single',
        last_name: 'User',
        email: 'single@test.com'
    })
    const enrollment = await makeEnrollment({
        user_id: user.id,
        course_id: course.id
    })

    return { course, user, enrollment }
}

/**
 * Scenario: Multiple enrollments
 * - 3 users, 3 courses, each user in each course (9 enrollments)
 */
export async function seedCrossEnrollments() {
    const courses = await Promise.all([
        makeCourse({ title: 'Course A' }),
        makeCourse({ title: 'Course B' }),
        makeCourse({ title: 'Course C' }),
    ])

    const users = await Promise.all([
        makeUser({ first_name: 'User', last_name: '1', email: 'user1@test.com' }),
        makeUser({ first_name: 'User', last_name: '2', email: 'user2@test.com' }),
        makeUser({ first_name: 'User', last_name: '3', email: 'user3@test.com' }),
    ])

    // Enroll each user in each course
    for (const user of users) {
        for (const course of courses) {
            await makeEnrollment({ user_id: user.id, course_id: course.id })
        }
    }

    return { courses, users }
}
