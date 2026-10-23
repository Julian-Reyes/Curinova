import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts: the React Router plugin is not needed for unit tests.
export default defineConfig({
  test: {
    name: '@lumen/web',
    environment: 'jsdom',
    include: ['app/**/*.test.{ts,tsx}'],
    setupFiles: ['app/test/setup.ts'],
  },
});
