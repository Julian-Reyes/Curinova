import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts: the React Router plugin is not needed for unit tests.
// Tests build their libraries from in-memory content (fixtures-style), never the bundle.
export default defineConfig({
  test: {
    name: '@lumen/web',
    environment: 'jsdom',
    include: ['app/**/*.test.{ts,tsx}'],
    setupFiles: ['app/test/setup.ts'],
  },
});
