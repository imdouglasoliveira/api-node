import { db } from '../client.ts'
import { users, courses, enrollments } from '../schema.ts'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { eq, and } from 'drizzle-orm'
import pino from 'pino'

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

const coursesData = [
    { "title": "Curso de React", "description": null },
    { "title": "n8n", "description": null },
    { "title": "TypeScript", "description": null },
    { "title": "Docker", "description": null },
    { "title": "PostgreSQL", "description": null },
    { "title": "Next.js", "description": null },
    { "title": "Go", "description": null },
    { "title": "Engenharia de Prompt", "description": null },
    { "title": "Python", "description": null },
    { "title": "Git", "description": null },
    { "title": "Bootstrap", "description": null },
    { "title": "Cursor AI", "description": "Cursor AI é um editor de código inteligente" },
    { "title": "Crewai", "description": "Crewai é um framework de IA para desenvolvimento de aplicativos" },
    { "title": "Multi agente com Crewai", "description": "Criando Multi Agent Systems com CrewAI" },
    { "title": "MCPs", "description": "MCPs são interfaces de comunicação para IA" },
    { "title": "Deploy com Crewai", "description": "Deploy de aplicações com CrewAI" },
    { "title": "Criando agentes com Agno" },
    { "title": "Soft Skills" },
    { "title": "Apps Desktop com Electron" },
    { "title": "Acessibilidade com ReactJS" }
];

async function seedUsers(count: number) {
    logger.info(`🌱 Iniciando seed para ${count} usuários...`);

    const usersToInsert = Array.from({ length: count }).map(() => ({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email().toLocaleLowerCase()
    }));

    const createdUsers = await db.insert(users).values(usersToInsert).returning();
    logger.info(`✅ ${createdUsers.length} usuários criados com sucesso!`);

    return createdUsers;
}

async function seedCourses(limit?: number) {
    logger.info(`🌱 Iniciando seed para cursos...`);

    let coursesToInsert = coursesData;

    if (limit && limit > 0 && Number.isInteger(limit)) {
        coursesToInsert = coursesToInsert.slice(0, limit);
        logger.info(`✅ Limite de ${limit} cursos aplicado.`);
    }

    const insertedCourses = [];
    let skippedCount = 0;

    for (const course of coursesToInsert) {
        const existingCourse = await db.select().from(courses).where(eq(courses.title, course.title)).limit(1);

        if (existingCourse.length === 0) {
            const [newCourse] = await db.insert(courses).values({
                title: course.title,
                description: course.description || null
            }).returning();
            insertedCourses.push(newCourse);
            logger.info(`✨ Curso "${newCourse.title}" criado`);
        } else {
            skippedCount++;
        }
    }

    logger.info(`✅ Cursos inseridos: ${insertedCourses.length} | Ignorados: ${skippedCount}`);

    return insertedCourses;
}

/**
 * Algoritmo de sorteio para criar matrículas (enrollments)
 * Estratégia: Cada usuário é matriculado em N cursos aleatórios sem repetição
 */
async function seedEnrollments(
    createdUsers: Array<{ id: number }>,
    createdCourses: Array<{ id: number }>,
    enrollmentsPerUser: number
) {
    logger.info(`🌱 Iniciando seed para matrículas...`);

    if (createdUsers.length === 0 || createdCourses.length === 0) {
        logger.warn('⚠️  Sem usuários ou cursos para criar matrículas.');
        return [];
    }

    // Ajusta enrollmentsPerUser se for maior que cursos disponíveis
    const maxEnrollments = Math.min(enrollmentsPerUser, createdCourses.length);
    if (maxEnrollments < enrollmentsPerUser) {
        logger.warn(`⚠️  Ajustando matrículas por usuário de ${enrollmentsPerUser} para ${maxEnrollments} (cursos disponíveis)`);
    }

    const enrollmentsToCreate = [];
    let skippedCount = 0;

    for (const user of createdUsers) {
        // Embaralha os cursos e pega os N primeiros (algoritmo de Fisher-Yates shuffle)
        const shuffledCourses = [...createdCourses].sort(() => Math.random() - 0.5);
        const selectedCourses = shuffledCourses.slice(0, maxEnrollments);

        for (const course of selectedCourses) {
            // Verifica se a matrícula já existe
            const existingEnrollment = await db
                .select()
                .from(enrollments)
                .where(
                    and(
                        eq(enrollments.user_id, user.id),
                        eq(enrollments.course_id, course.id)
                    )
                )
                .limit(1);

            if (existingEnrollment.length === 0) {
                enrollmentsToCreate.push({
                    user_id: user.id,
                    course_id: course.id
                });
            } else {
                skippedCount++;
            }
        }
    }

    // Insere todas as matrículas de uma vez
    let createdEnrollments = [];
    if (enrollmentsToCreate.length > 0) {
        createdEnrollments = await db.insert(enrollments).values(enrollmentsToCreate).returning();
        logger.info(`✅ ${createdEnrollments.length} matrículas criadas!`);
    }

    if (skippedCount > 0) {
        logger.warn(`⚠️  ${skippedCount} matrículas já existentes foram ignoradas.`);
    }

    return createdEnrollments;
}

async function seedAll() {
    try {
        logger.info('🚀 Iniciando seed completo do banco de dados...\n');

        // Parse dos argumentos da linha de comando
        const args = process.argv.slice(2);
        let usersCount = 5; // padrão
        let coursesLimit: number | undefined = undefined; // todos por padrão
        let enrollmentsPerUser = 3; // padrão: cada usuário matriculado em 3 cursos

        // Processa argumentos --users=N, --courses=N e --enrollments=N
        for (const arg of args) {
            if (arg.startsWith('--users=')) {
                usersCount = parseInt(arg.split('=')[1]);
            } else if (arg.startsWith('--courses=')) {
                coursesLimit = parseInt(arg.split('=')[1]);
            } else if (arg.startsWith('--enrollments=')) {
                enrollmentsPerUser = parseInt(arg.split('=')[1]);
            }
        }

        // Validações
        if (usersCount <= 0 || !Number.isInteger(usersCount)) {
            logger.error('❌ Erro: A quantidade de usuários deve ser um número inteiro positivo.');
            process.exit(1);
        }

        if (coursesLimit !== undefined && (coursesLimit <= 0 || !Number.isInteger(coursesLimit))) {
            logger.error('❌ Erro: O limite de cursos deve ser um número inteiro positivo.');
            process.exit(1);
        }

        if (enrollmentsPerUser <= 0 || !Number.isInteger(enrollmentsPerUser)) {
            logger.error('❌ Erro: A quantidade de matrículas por usuário deve ser um número inteiro positivo.');
            process.exit(1);
        }

        // Executa os seeds de usuários e cursos em paralelo
        const [createdUsers, createdCourses] = await Promise.all([
            seedUsers(usersCount),
            seedCourses(coursesLimit)
        ]);

        // Cria as matrículas (enrollments) após ter usuários e cursos
        const createdEnrollments = await seedEnrollments(createdUsers, createdCourses, enrollmentsPerUser);

        logger.info('\n🎉 Seed completo finalizado com sucesso!');
        logger.info(`📊 Resumo: ${createdUsers.length} usuários | ${createdCourses.length} cursos | ${createdEnrollments.length} matrículas`);

    } catch (error) {
        logger.error('❌ Erro ao executar seed:', error);
        process.exit(1);
    }
}

seedAll();
