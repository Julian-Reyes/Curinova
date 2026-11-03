import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LessonVariantSchema } from '@lumen/domain';
import { loadTree } from '../validate/tree';
import { findDuplicates } from './dedupe';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const trees = await Promise.all([
  loadTree(repoRoot, 'content', 'real'),
  loadTree(repoRoot, 'content/drafts', 'real'),
]);
const variants = new Map(
  trees
    .flatMap((t) => t.files)
    .filter((f) => /\/variant\.[^.]+\.json$/.test(f.path))
    .flatMap((f) => {
      const r = LessonVariantSchema.safeParse(f.data);
      return r.success ? [r.data] : [];
    })
    .map((v) => [v.id, v]), // a draft replaces the library copy with the same ID
);
const pairs = findDuplicates([...variants.values()]);
for (const p of pairs) console.log(`${p.similarity.toFixed(2)}  ${p.locale}  ${p.a}  ↔  ${p.b}`);
console.log(
  pairs.length === 0 ? 'No near-duplicate lessons.' : `${String(pairs.length)} pair(s) to look at.`,
);
