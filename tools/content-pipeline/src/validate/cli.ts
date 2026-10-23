import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatReport } from './report';
import { loadTree } from './tree';
import { validateContent } from './validate';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const verbose = process.argv.includes('--verbose');

try {
  const trees = await Promise.all([
    loadTree(repoRoot, 'content', 'real'),
    loadTree(repoRoot, 'content/fixtures', 'fixtures'),
  ]);
  const result = validateContent(trees);
  console.log(formatReport(result, verbose));
  process.exitCode = result.issues.some((i) => i.severity === 'error') ? 1 : 0;
} catch (error) {
  console.error('content:validate could not read the content directory:', error);
  process.exitCode = 2;
}
