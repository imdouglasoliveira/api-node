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
        globals: true,
        environment: 'node',
        setupFiles: [resolve(__dirname, 'src/tests/setup.ts')],
        testTimeout: 30000, // 30 seconds for each test
        hookTimeout: 30000, // 30 seconds for hooks (beforeAll, afterAll)
        coverage: {
            enabled: true,
            all: true,
            provider: 'v8',
            reporter: ['text', 'html', 'json', 'lcov'],
            reportsDirectory: './coverage',
            include: ['src/**/*.ts'],
            exclude: [
                'node_modules/',
                'src/tests/**',
                'src/scripts/**',
                '**/*.config.ts',
                '**/*.d.ts',
                '**/dist/**',
                '**/coverage/**',
                '**/__tests__/**',
            ]
        }
    },
})