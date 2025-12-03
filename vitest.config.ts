import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/fixtures/**'],
    environment: 'node',
    globals: false,
    mockReset: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'dist/**',
        'tests/**',
        '**/*.test.ts',
        '**/*.config.*',
        'examples/**',
        'docs/**',
      ],
      include: ['src/**/*.ts'],
    },
  },
})
