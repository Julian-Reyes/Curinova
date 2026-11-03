import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSnapshot } from '../sources/store';
import { loadTree } from '../validate/tree';
import { checkDrafts } from './check';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const report = await checkDrafts(
  await loadTree(repoRoot, 'content', 'real'),
  await loadTree(repoRoot, 'content/drafts', 'real'),
  (id) => readSnapshot(repoRoot, id),
);
const errors = report.issues.filter((i) => i.severity === 'error');
const warnings = report.issues.filter(
  (i) => i.severity === 'warning' && i.file.startsWith('content/drafts/'),
);
for (const i of [...errors, ...warnings])
  console.log(
    `${i.severity === 'error' ? '✖' : '⚠'} ${i.file}${i.field ? ` › ${i.field}` : ''}: ${i.message}`,
  );
const v = report.verdicts;
console.log(
  `\n${String(report.variants)} draft variant(s). Claims: ${String(v.supported)} supported, ${String(v.partial)} partial, ${String(v.unsupported)} unsupported, ${String(v.pending)} not verified yet.`,
);
console.log(errors.length === 0 ? '✔ drafts pass.' : `✖ ${String(errors.length)} error(s).`);
process.exitCode = errors.length > 0 ? 1 : 0;
