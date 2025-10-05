import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    first_name: text('first_name').notNull(),
    last_name: text('last_name').notNull(),
    email: text('email').notNull().unique(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const courses = sqliteTable('courses', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull().unique(),
    description: text('description'),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const enrollments = sqliteTable('enrollments', {
    user_id: integer('user_id').notNull().references(() => users.id),
    course_id: integer('course_id').notNull().references(() => courses.id),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});