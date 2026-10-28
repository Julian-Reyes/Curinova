import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SourceSchema } from '@lumen/domain';
import { loadTree } from '../validate/tree';
import { checkLinks, type LinkResult } from './check';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const cachePath = join(repoRoot, '.cache/link-check.json');
const trees = await Promise.all([
  loadTree(repoRoot, 'content', 'real'),
  loadTree(repoRoot, 'content/drafts', 'real'),
]);
const urls = trees
  .flatMap((t) => t.files)
  .filter((f) => /\/sources\/[^/]+\.json$/.test(f.path))
  .map((f) => SourceSchema.safeParse(f.data))
  .flatMap((r) => (r.success ? [r.data.url] : []));
const cache = existsSync(cachePath)
  ? (JSON.parse(await readFile(cachePath, 'utf8')) as Record<string, LinkResult>)
  : {};
const results = await checkLinks(
  urls,
  process.argv.includes('--fresh') ? {} : cache,
  fetch,
  new Date(),
);
await mkdir(dirname(cachePath), { recursive: true });
await writeFile(
  cachePath,
  JSON.stringify(Object.fromEntries(results.map((r) => [r.url, r])), null, 2),
);
const broken = results.filter((r) => !r.ok);
for (const r of broken) console.log(`✖ ${r.url}: ${r.reason ?? ''}`);
console.log(`${String(results.length)} source link(s) checked, ${String(broken.length)} broken.`);
process.exitCode = broken.length > 0 ? 1 : 0;
