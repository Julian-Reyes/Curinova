import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Regenerate icons with `pnpm --filter @lumen/web icons` after changing public/favicon.svg.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      padding: 0.1,
      resizeOptions: { background: '#087F75' },
    },
    apple: { ...minimal2023Preset.apple, padding: 0.1, resizeOptions: { background: '#087F75' } },
  },
  images: ['public/favicon.svg'],
});
