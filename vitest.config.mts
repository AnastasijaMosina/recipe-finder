import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.{test,spec}.ts', 'app/**/*.{test,spec}.tsx'],
    clearMocks: true,
  },
});
