import { db } from '../../database/client.ts'
import { courses } from '../../database/schema.ts'
import { generateCourseMock } from '../utils/mocks/course.mock.ts'

interface MakeCourseOptions {
    title?: string
    description?: string | null
}

export async function makeCourse(overrides?: MakeCourseOptions) {
    const mockCourse = generateCourseMock()

    const courseData = {
        title: overrides?.title ?? mockCourse.title,
        description: overrides?.description !== undefined ? overrides.description : mockCourse.description
    }

    const [course] = await db
        .insert(courses)
        .values(courseData)
        .returning()

    return course
}