import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    test: {
        env: {
            NODE_ENV: 'test',
        },
        envFile: '.env.test',
        globals: true,
        environment: 'node',
        setupFiles: [resolve(__dirname, 'src/tests/setup.ts')],
        testTimeout: 30000, // 30 seconds for each test
        hookTimeout: 30000, // 30 seconds for hooks (beforeAll, afterAll)
    },
})