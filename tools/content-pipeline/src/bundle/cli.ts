import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ContentChannel } from '@lumen/domain';
import { FIRST_VISIT_BUDGET_BYTES, writeContentBuild } from './write';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const arg = process.argv.find((a) => a.startsWith('--channel='))?.split('=')[1];
const channel = (arg ?? process.env.LUMEN_PUBLIC_CONTENT_CHANNEL ?? 'preview') as ContentChannel;
if (!['production', 'preview', 'fixtures'].includes(channel)) {
  console.error(`Unknown channel "${channel}"; use production, preview or fixtures.`);
  process.exit(2);
}

try {
  const out = join(repoRoot, 'apps/web/public/content');
  const result = await writeContentBuild(repoRoot, channel, out);
  const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
  console.log(
    `content:build (${channel}) → apps/web/public/content, ${String(result.files.size)} files`,
  );
  for (const [locale, bytes] of Object.entries(result.firstVisitGzip))
    console.log(
      `  first visit ${locale}: ${kb(bytes)} compressed (budget ${kb(FIRST_VISIT_BUDGET_BYTES)})`,
    );
} catch (error) {
  console.error(`content:build failed: ${(error as Error).message}`);
  process.exitCode = 1;
}
