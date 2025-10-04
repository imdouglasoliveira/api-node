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

const coursesData = [{"title":"Curso de React","description":null},{"title":"n8n","description":null},{"title":"TypeScript","description":null},{"title":"Docker","description":null},{"title":"PostgreSQL","description":null},{"title":"Next.js","description":null},{"title":"Go","description":null},{"title":"Engenharia de Prompt","description":null},{"title":"Python","description":null},{"title":"Git","description":null},{"title":"Bootstrap","description":null},{"title":"Cursor AI","description":"Cursor AI é um editor de código inteligente"},{"title":"Crewai","description":"Crewai é um framework de IA para desenvolvimento de aplicativos"},{"title":"Multi agente com Crewai","description":"Criando Multi Agent Systems com CrewAI"},{"title":"MCPs","description":"MCPs são interfaces de comunicação para IA"},{"title":"Deploy com Crewai","description":"Deploy de aplicações com CrewAI"},{"title":"Criando agentes com Agno"},{"title":"Soft Skills"},{"title":"Apps Desktop com Electron"},{"title":"Acessibilidade com ReactJS"}];

async function seed(limit?: number) {
    logger.info(`🌱 Iniciando seed para cursos...`);

    let coursesToInsert = coursesData;

    if (limit && limit > 0 && Number.isInteger(limit)) {
        coursesToInsert = coursesToInsert.slice(0, limit);
        logger.info(`✅ Limite de ${limit} cursos aplicado.`);
    } else if (limit !== undefined) {
        logger.error('❌ Erro: O limite de cursos deve ser um número inteiro positivo.');
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
            logger.info(`✨ Curso "${newCourse.title}" criado com sucesso!`);
        } else {
            logger.warn(`⚠️  Curso "${course.title}" já existe e foi ignorado.`);
            skippedCount++;
        }
    }

    logger.info(`✅ Seed de cursos concluído!`);
    logger.info(`Cursos inseridos: ${insertedCourses.length}`);
    logger.info(`Cursos ignorados (já existentes): ${skippedCount}`);
    //logger.info('Dados dos cursos criados:', insertedCourses);
}

// Get the amount of the command line argument, if provided
const limitCoursesToCreate = process.argv[2] ? parseInt(process.argv[2]) : undefined;

seed(limitCoursesToCreate).catch(console.error);
