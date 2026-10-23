import type { Config } from '@react-router/dev/config';

interface PwaPlugin {
  name: string;
  api?: { generateSW: () => Promise<void> };
}

export default {
  appDirectory: 'app',
  ssr: false,
  prerender: ['/'],
  future: {
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
    // v8_viteEnvironmentApi stays off: with it, vite-plugin-pwa 2.0 emits no service worker.
    v8_viteEnvironmentApi: false,
  },
  // vite-plugin-pwa builds the service worker before React Router prerenders HTML,
  // so the first precache list misses index.html and the SPA fallback. Regenerate it
  // once everything is on disk. See docs/DECISIONS.md (D-PWA-1).
  async buildEnd({ viteConfig }) {
    const pwa = viteConfig.plugins.find((p) => p.name === 'vite-plugin-pwa') as
      PwaPlugin | undefined;
    if (pwa?.api === undefined)
      throw new Error('vite-plugin-pwa not found; the service worker would be stale');
    await pwa.api.generateSW();
  },
} satisfies Config;
