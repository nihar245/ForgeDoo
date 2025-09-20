import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'tests/**/*.test.js',
      'tests/**/*.test.ts',
      'src/**/*.test.js',
      'src/**/*.test.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cache/**',
      '**/logs/**'
    ],
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/testUtils.js']
  }
});