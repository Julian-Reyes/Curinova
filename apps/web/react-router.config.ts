import type { Config } from '@react-router/dev/config';
import { join } from 'node:path';
// Relative imports with extensions: this file is loaded by Node (see vite.config.ts).
import { SITE_URL } from '../../packages/domain/src/brand.ts';
import { checkPrerenderedPages, writeSiteFiles } from './app/public/site-files.ts';
import { listSitePages } from './app/public/site-pages.ts';

interface PwaPlugin {
  name: string;
  api?: { generateSW: () => Promise<void> };
}

/** The content bundle written by the lumen-content plugin at the start of every build. */
const CONTENT_DIR = join(import.meta.dirname, 'public/content');

export default {
  appDirectory: 'app',
  ssr: false,
  // The app shell, plus a static page for every published lesson, topic and trail (§7.1).
  prerender: () => ['/', ...listSitePages(CONTENT_DIR).map((p) => p.path)],
  future: {
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
    // v8_viteEnvironmentApi stays off: with it, vite-plugin-pwa 2.0 emits no service worker.
    v8_viteEnvironmentApi: false,
  },
  async buildEnd({ viteConfig, reactRouterConfig }) {
    // Sitemaps and robots.txt, then the build check: every public page must have its
    // static HTML with title, description, canonical, hreflang, og:image and JSON-LD (§16).
    const clientDir = join(reactRouterConfig.buildDirectory, 'client');
    const pages = listSitePages(CONTENT_DIR);
    writeSiteFiles(clientDir, pages, SITE_URL);
    const problems = checkPrerenderedPages(clientDir, pages, SITE_URL);
    if (problems.length > 0)
      throw new Error(`Prerendered pages are incomplete:\n${problems.slice(0, 20).join('\n')}`);

    // vite-plugin-pwa builds the service worker before React Router prerenders HTML,
    // so the first precache list misses index.html and the SPA fallback. Regenerate it
    // once everything is on disk. See docs/DECISIONS.md (D-PWA-1).
    const pwa = viteConfig.plugins.find((p) => p.name === 'vite-plugin-pwa') as
      PwaPlugin | undefined;
    if (pwa?.api === undefined)
      throw new Error('vite-plugin-pwa not found; the service worker would be stale');
    await pwa.api.generateSW();
  },
} satisfies Config;
