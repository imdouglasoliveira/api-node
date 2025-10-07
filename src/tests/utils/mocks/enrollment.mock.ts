
import { fakerPT_BR as faker } from '@faker-js/faker';

export interface EnrollmentMock {
    id?: number;
    user_id: number;
    course_id: number;
    created_at?: number;
    updated_at?: number;
}

export function generateEnrollmentMock(userId: number, courseId: number, id?: number): EnrollmentMock {
    return {
        id: id,
        user_id: userId,
        course_id: courseId,
        created_at: id ? faker.date.recent().getTime() : undefined,
        updated_at: id ? faker.date.recent().getTime() : undefined
    };
}

export function generateEnrollmentMocks(count: number, userIds: number[], courseIds: number[]): EnrollmentMock[] {
    const enrollments: EnrollmentMock[] = [];
    for (let i = 0; i < count; i++) {
        const randomUserId = faker.helpers.arrayElement(userIds);
        const randomCourseId = faker.helpers.arrayElement(courseIds);
        enrollments.push(generateEnrollmentMock(randomUserId, randomCourseId, i + 1));
    }
    return enrollments;
}
