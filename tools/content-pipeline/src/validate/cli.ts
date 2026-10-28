import { readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatReport } from './report';
import { loadTree } from './tree';
import { validateContent } from './validate';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const verbose = process.argv.includes('--verbose');

/** Processed lesson images as URL paths ("/media/<lesson>/<file>.webp"). */
async function listMedia(): Promise<Set<string>> {
  const root = join(repoRoot, 'apps/web/public/media');
  const out = new Set<string>();
  let dirs;
  try {
    dirs = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return out;
    throw error;
  }
  for (const dir of dirs.filter((d) => d.isDirectory()))
    for (const file of await readdir(join(root, dir.name)))
      if (file.endsWith('.webp')) out.add(`/media/${dir.name}/${file}`);
  return out;
}

try {
  const trees = await Promise.all([
    loadTree(repoRoot, 'content', 'real'),
    loadTree(repoRoot, 'content/fixtures', 'fixtures'),
  ]);
  const result = validateContent(trees, { mediaFiles: await listMedia() });
  console.log(formatReport(result, verbose));
  process.exitCode = result.issues.some((i) => i.severity === 'error') ? 1 : 0;
} catch (error) {
  console.error('content:validate could not read the content directory:', error);
  process.exitCode = 2;
}
