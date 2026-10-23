import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
// Relative import: Vite loads this config with Node, which cannot resolve the domain
// package's extensionless TypeScript imports. brand.ts has no imports of its own.
import { BRAND, CODENAME } from '../../packages/domain/src/brand.ts';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * `vite preview` mimics a static host: app routes that were not prerendered fall
 * back to the SPA shell, as the production host's rewrite rule will (M5).
 */
function spaFallbackInPreview(): Plugin {
  return {
    name: 'lumen-spa-fallback-preview',
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? '/';
        if (req.method === 'GET' && url.startsWith('/app') && !/\.[a-z0-9]+(\?|$)/i.test(url)) {
          req.url = '/__spa-fallback.html';
        }
        next();
      });
    },
  };
}

export default defineConfig({
  envPrefix: 'LUMEN_PUBLIC_',
  plugins: [
    tailwindcss(),
    reactRouter(),
    spaFallbackInPreview(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: '/',
        name: BRAND.name,
        short_name: BRAND.shortName,
        description: 'Scroll with curiosity. Leave with knowledge.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F7FAF8',
        theme_color: '#087F75',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Permanent cache prefix: never derived from the display name.
        cacheId: CODENAME,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
        navigateFallback: '/__spa-fallback.html',
        navigateFallbackDenylist: [/^\/_review/],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
});
