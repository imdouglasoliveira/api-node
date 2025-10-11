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
    { "title": "Cursor AI", "description": "Cursor AI is an intelligent code editor" },
    { "title": "Crewai", "description": "Crewai is an AI framework for application development" },
    { "title": "Multi agente com Crewai", "description": "Creating Multi Agent Systems with CrewAI" },
    { "title": "MCPs", "description": "MCPs are communication interfaces for AI" },
    { "title": "Deploy com Crewai", "description": "Deploying applications with CrewAI" },
    { "title": "Criando agentes com Agno" },
    { "title": "Soft Skills" },
    { "title": "Apps Desktop com Electron" },
    { "title": "Acessibilidade com ReactJS" }
];

async function seedUsers(count: number) {
    logger.info(`🌱 Starting seed for ${count} users...`);

    const usersToInsert = Array.from({ length: count }).map(() => ({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email().toLocaleLowerCase()
    }));

    const createdUsers = await db.insert(users).values(usersToInsert).returning();
    logger.info(`✅ ${createdUsers.length} users created successfully!`);

    return createdUsers;
}

async function seedCourses(limit?: number) {
    logger.info(`🌱 Starting seed for courses...`);

    let coursesToInsert = coursesData;

    if (limit && limit > 0 && Number.isInteger(limit)) {
        coursesToInsert = coursesToInsert.slice(0, limit);
        logger.info(`✅ Limit of ${limit} courses applied.`);
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
            logger.info(`✨ Course "${newCourse.title}" created`);
        } else {
            skippedCount++;
        }
    }

    logger.info(`✅ Courses inserted: ${insertedCourses.length} | Skipped: ${skippedCount}`);

    return insertedCourses;
}

/**
 * Enrollment draw algorithm
 * Strategy: Each user is enrolled in N random courses without repetition
 */
async function seedEnrollments(
    createdUsers: Array<{ id: number }>,
    createdCourses: Array<{ id: number }>,
    enrollmentsPerUser: number
) {
    logger.info(`🌱 Starting seed for enrollments...`);

    if (createdUsers.length === 0 || createdCourses.length === 0) {
        logger.warn('⚠️  No users or courses to create enrollments.');
        return [];
    }

    // Adjust enrollmentsPerUser if greater than available courses
    const maxEnrollments = Math.min(enrollmentsPerUser, createdCourses.length);
    if (maxEnrollments < enrollmentsPerUser) {
        logger.warn(`⚠️  Adjusting enrollments per user from ${enrollmentsPerUser} to ${maxEnrollments} (available courses)`);
    }

    const enrollmentsToCreate = [];
    let skippedCount = 0;

    for (const user of createdUsers) {
        // Shuffle courses and take first N (Fisher-Yates shuffle algorithm)
        const shuffledCourses = [...createdCourses].sort(() => Math.random() - 0.5);
        const selectedCourses = shuffledCourses.slice(0, maxEnrollments);

        for (const course of selectedCourses) {
            // Check if enrollment already exists
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

    // Insert all enrollments at once
    let createdEnrollments = [];
    if (enrollmentsToCreate.length > 0) {
        createdEnrollments = await db.insert(enrollments).values(enrollmentsToCreate).returning();
        logger.info(`✅ ${createdEnrollments.length} enrollments created!`);
    }

    if (skippedCount > 0) {
        logger.warn(`⚠️  ${skippedCount} already existing enrollments were skipped.`);
    }

    return createdEnrollments;
}

async function seedAll() {
    try {
        logger.info('🚀 Starting complete database seed...\n');

        // Parse command line arguments
        const args = process.argv.slice(2);
        let usersCount = 5; // default
        let coursesLimit: number | undefined = undefined; // all by default
        let enrollmentsPerUser = 3; // default: each user enrolled in 3 courses

        // Process arguments --users=N, --courses=N and --enrollments=N
        for (const arg of args) {
            if (arg.startsWith('--users=')) {
                usersCount = parseInt(arg.split('=')[1]);
            } else if (arg.startsWith('--courses=')) {
                coursesLimit = parseInt(arg.split('=')[1]);
            } else if (arg.startsWith('--enrollments=')) {
                enrollmentsPerUser = parseInt(arg.split('=')[1]);
            }
        }

        // Validations
        if (usersCount <= 0 || !Number.isInteger(usersCount)) {
            logger.error('❌ Error: The number of users must be a positive integer.');
            process.exit(1);
        }

        if (coursesLimit !== undefined && (coursesLimit <= 0 || !Number.isInteger(coursesLimit))) {
            logger.error('❌ Error: The course limit must be a positive integer.');
            process.exit(1);
        }

        if (enrollmentsPerUser <= 0 || !Number.isInteger(enrollmentsPerUser)) {
            logger.error('❌ Error: The number of enrollments per user must be a positive integer.');
            process.exit(1);
        }

        // Execute user and course seeds in parallel
        const [createdUsers, createdCourses] = await Promise.all([
            seedUsers(usersCount),
            seedCourses(coursesLimit)
        ]);

        // Create enrollments after having users and courses
        const createdEnrollments = await seedEnrollments(createdUsers, createdCourses, enrollmentsPerUser);

        logger.info('\n🎉 Complete seed finished successfully!');
        logger.info(`📊 Summary: ${createdUsers.length} users | ${createdCourses.length} courses | ${createdEnrollments.length} enrollments`);

    } catch (error) {
        logger.error('❌ Error executing seed:', error);
        process.exit(1);
    }
}

seedAll();
