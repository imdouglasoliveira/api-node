import { db } from '../client.ts'
import { courses } from '../schema.ts'
import pino from 'pino'
import { eq } from 'drizzle-orm'

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

const coursesData = [{"title":"Curso de React","description":null},{"title":"n8n","description":null},{"title":"TypeScript","description":null},{"title":"Docker","description":null},{"title":"PostgreSQL","description":null},{"title":"Next.js","description":null},{"title":"Go","description":null},{"title":"Engenharia de Prompt","description":null},{"title":"Python","description":null},{"title":"Git","description":null},{"title":"Bootstrap","description":null},{"title":"Cursor AI","description":"Cursor AI is an intelligent code editor"},{"title":"Crewai","description":"Crewai is an AI framework for application development"},{"title":"Multi agente com Crewai","description":"Creating Multi Agent Systems with CrewAI"},{"title":"MCPs","description":"MCPs are communication interfaces for AI"},{"title":"Deploy com Crewai","description":"Deploying applications with CrewAI"},{"title":"Criando agentes com Agno"},{"title":"Soft Skills"},{"title":"Apps Desktop com Electron"},{"title":"Acessibilidade com ReactJS"}];

async function seed(limit?: number) {
    logger.info(`🌱 Starting seed for courses...`);

    let coursesToInsert = coursesData;

    if (limit && limit > 0 && Number.isInteger(limit)) {
        coursesToInsert = coursesToInsert.slice(0, limit);
        logger.info(`✅ Limit of ${limit} courses applied.`);
    } else if (limit !== undefined) {
        logger.error('❌ Error: Course limit must be a positive integer.');
        process.exit(1);
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
            logger.info(`✨ Course "${newCourse.title}" created successfully!`);
        } else {
            logger.warn(`⚠️  Course "${course.title}" already exists and was skipped.`);
            skippedCount++;
        }
    }

    logger.info(`✅ Course seed completed!`);
    logger.info(`Courses inserted: ${insertedCourses.length}`);
    logger.info(`Courses skipped (already existing): ${skippedCount}`);
    //logger.info('Created courses data:', insertedCourses);
}

// Get the amount of the command line argument, if provided
const limitCoursesToCreate = process.argv[2] ? parseInt(process.argv[2]) : undefined;

seed(limitCoursesToCreate).catch(console.error);
