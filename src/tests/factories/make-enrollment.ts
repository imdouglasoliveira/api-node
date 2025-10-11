import { db } from '../../database/client.ts'
import { enrollments } from '../../database/schema.ts'
import { makeUser } from './make-user.ts'
import { makeCourse } from './make-course.ts'

// Mock interface for enrollment
interface MakeEnrollmentOptions {
    user_id?: number
    course_id?: number
}

// Generate a mock enrollment
export async function makeEnrollment(overrides?: MakeEnrollmentOptions) {
    // If user_id or course_id is not provided, create automatically
    const userId = overrides?.user_id ?? (await makeUser()).id
    const courseId = overrides?.course_id ?? (await makeCourse()).id

    const [enrollment] = await db
        .insert(enrollments)
        .values({
            user_id: userId,
            course_id: courseId
        })
        .returning()

    return enrollment
}
