
import { fakerPT_BR as faker } from '@faker-js/faker';

export interface UserMock {
    id?: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at?: number;
    updated_at?: number;
}

export function generateUserMock(id?: number): UserMock {
    return {
        id: id,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email().toLocaleLowerCase(),
        created_at: id ? faker.date.recent().getTime() : undefined, // Apenas para usuários com ID simulado
        updated_at: id ? faker.date.recent().getTime() : undefined // Apenas para usuários com ID simulado
    };
}

export function generateUserMocks(count: number): UserMock[] {
    return Array.from({ length: count }, (_, i) => generateUserMock(i + 1));
}
