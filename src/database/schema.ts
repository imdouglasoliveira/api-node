import { pgTable, uuid, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid().primaryKey().defaultRandom(),
    first_name: text().notNull(),
    last_name: text().notNull(),
    email: text().notNull().unique()
});