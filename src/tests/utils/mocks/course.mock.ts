
import { fakerPT_BR as faker } from '@faker-js/faker';

export interface CourseMock {
    id?: number;
    title: string;
    description?: string | null;
    created_at?: number;
    updated_at?: number;
}

export function generateCourseMock(id?: number): CourseMock {
    return {
        id: id,
        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        created_at: id ? faker.date.recent().getTime() : undefined,
        updated_at: id ? faker.date.recent().getTime() : undefined
    };
}

export function generateCourseMocks(count: number): CourseMock[] {
    return Array.from({ length: count }, (_, i) => generateCourseMock(i + 1));
}
