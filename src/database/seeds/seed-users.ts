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
        logger.error('❌ Erro: A quantidade de usuários deve ser um número inteiro positivo.');
        process.exit(1);
    }

    logger.info(`🌱 Iniciando seed para ${count} usuários...`);

    const usersToInsert = Array.from({ length: count }).map(() => ({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email().toLocaleLowerCase()
    }));

    logger.info('Usuários a serem inseridos:', usersToInsert);
    console.log('DEBUG: Usuários a serem inseridos (console.log):', usersToInsert);

    const createdUsers = await db.insert(users).values(usersToInsert).returning();
    logger.info('Resultado de createdUsers (antes do log final):', createdUsers);
    console.log('DEBUG: Resultado de createdUsers (console.log):', createdUsers);
    logger.info(`✅ ${count} usuários criados com sucesso!`);
    logger.info('Dados dos usuários criados:', createdUsers);
}

// Get the amount of the command line argument, if provided
const numUsersToCreate = process.argv[2] ? parseInt(process.argv[2]) : undefined;

seed(numUsersToCreate);