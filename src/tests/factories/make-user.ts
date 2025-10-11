import { db } from '../../database/client.ts'
import { users } from '../../database/schema.ts'
import { generateUserMock } from '../utils/mocks/user.mock.ts'

interface MakeUserOptions {
    first_name?: string
    last_name?: string
    email?: string
}

export async function makeUser(overrides?: MakeUserOptions) {
    const mockUser = generateUserMock()

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
