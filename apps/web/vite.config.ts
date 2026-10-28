import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
// Relative import: Vite loads this config with Node, which cannot resolve the domain
// package's extensionless TypeScript imports. brand.ts has no imports of its own.
import { BRAND, CODENAME } from '../../packages/domain/src/brand.ts';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { lumenContent, type ContentChannel } from './content-plugin.ts';

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

const CHANNELS: readonly ContentChannel[] = ['production', 'preview', 'fixtures'];
/**
 * Which content the app shows. "preview" (default until reviewed lessons exist)
 * includes unreviewed drafts, labeled as such in the UI. "fixtures" is for tests.
 */
function contentChannel(): ContentChannel {
  const value = process.env.LUMEN_PUBLIC_CONTENT_CHANNEL ?? 'preview';
  if (!(CHANNELS as readonly string[]).includes(value)) {
    throw new Error(
      `LUMEN_PUBLIC_CONTENT_CHANNEL must be one of ${CHANNELS.join(', ')}; got "${value}"`,
    );
  }
  return value as ContentChannel;
}

// Dedicated ports (not Vite's shared default 5173), failing loudly if taken, so
// "localhost" can never silently show another project's dev server.
export const DEV_PORT = 5273;
export const PREVIEW_PORT = 4273;

export default defineConfig({
  envPrefix: 'LUMEN_PUBLIC_',
  server: { port: DEV_PORT, strictPort: true },
  preview: { port: PREVIEW_PORT, strictPort: true },
  plugins: [
    tailwindcss(),
    lumenContent(contentChannel()),
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
        background_color: '#FBF8F4',
        theme_color: '#17151A',
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
        navigateFallbackDenylist: [/^\/_review/, /^\/media\//, /^\/content\//],
        cleanupOutdatedCaches: true,
        // Lesson images aren't precached (they'd add megabytes to install). Each one is
        // cached the first time it's shown, so lessons already seen keep their images
        // offline; anything else falls back to the lesson's diagram (D15/P15).
        runtimeCaching: [
          // Content (D16): the manifest is checked online first (offline: last copy);
          // every other content file has a hashed name, so a cached copy is never stale.
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && url.pathname === '/content/manifest.json',
            handler: 'NetworkFirst',
            options: {
              cacheName: `${CODENAME}-content-manifest`,
              networkTimeoutSeconds: 4,
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin &&
              url.pathname.startsWith('/content/') &&
              url.pathname !== '/content/manifest.json',
            handler: 'CacheFirst',
            options: {
              cacheName: `${CODENAME}-content`,
              expiration: { maxEntries: 200, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/media/'),
            handler: 'CacheFirst',
            options: {
              cacheName: `${CODENAME}-media`,
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 90,
                purgeOnQuotaError: true,
              },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
});
