import { db } from '../client.ts'
import { users } from '../schema.ts'
import { fakerPT_BR as faker } from '@faker-js/faker'
import pino from 'pino'

// Add Logger
const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            singleLine: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            colorize: true
        }
    }
});

async function seed(count: number = 2) {
    if (count <= 0 || !Number.isInteger(count)) {
        logger.error('❌ Error: The number of users must be a positive integer.');
        process.exit(1);
    }

    logger.info(`🌱 Starting seed for ${count} users...`);

    const usersToInsert = Array.from({ length: count }).map(() => ({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email().toLocaleLowerCase()
    }));

    logger.info('Users to be inserted:', usersToInsert);
    console.log('DEBUG: Users to be inserted (console.log):', usersToInsert);

    const createdUsers = await db.insert(users).values(usersToInsert).returning();
    logger.info('Result of createdUsers (before final log):', createdUsers);
    console.log('DEBUG: Result of createdUsers (console.log):', createdUsers);
    logger.info(`✅ ${count} users created successfully!`);
    logger.info('Created users data:', createdUsers);
}

// Get the amount of the command line argument, if provided
const numUsersToCreate = process.argv[2] ? parseInt(process.argv[2]) : undefined;

seed(numUsersToCreate);
