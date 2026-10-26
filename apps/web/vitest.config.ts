import { defineConfig } from 'vitest/config';
import { lumenContent } from './content-plugin.ts';

// Separate from vite.config.ts: the React Router plugin is not needed for unit tests.
// Tests that load the content bundle only ever see the fake fixtures.
export default defineConfig({
  plugins: [lumenContent('fixtures')],
  test: {
    name: '@lumen/web',
    environment: 'jsdom',
    include: ['app/**/*.test.{ts,tsx}'],
    setupFiles: ['app/test/setup.ts'],
  },
});
