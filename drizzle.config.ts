import { config } from 'dotenv';
config();

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'sqlite',
    schema: './src/database/schema.ts',
    out: './drizzle',
    dbCredentials: {
        url: './src/database/dev.db',
    }
});