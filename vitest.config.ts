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
            enabled: true, // Enable coverage
            provider: 'v8',
            reporter: ['text', 'html', 'json', 'lcov'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/',
                'src/tests/**',
                'src/scripts/**',
                '**/*.config.ts',
                '**/*.d.ts',
                '**/dist/**',
                '**/coverage/**',
                '**/__tests__/**',
            ],
            // Thresholds: Bloqueia se cobertura abaixo do mínimo
            thresholds: {
                lines: 70,        // 70% das linhas cobertas
                functions: 70,    // 70% das funções cobertas
                branches: 60,     // 60% dos branches cobertos
                statements: 70    // 70% dos statements cobertos
            }
        }
    },
})