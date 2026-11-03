import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { libraryFromTrees } from '../bundle/build';
import { loadTree } from '../validate/tree';
import { contentStats, dueForReview } from './reports';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const lib = libraryFromTrees([await loadTree(repoRoot, 'content', 'real')]);

if (process.argv[2] === 'due') {
  const due = dueForReview(lib, new Date());
  console.log(
    due.length === 0
      ? 'No published lessons are due for re-review.'
      : `${String(due.length)} due for re-review:`,
  );
  for (const d of due)
    console.log(`  ${d.variantId}  (review after ${d.reviewAfter.slice(0, 10)})`);
} else {
  const rows = contentStats(lib);
  console.log('topic                 trails lessons  pt-BR pub/rev/draft  en pub/rev/draft');
  for (const r of rows) {
    const cell = (l: 'pt-BR' | 'en') => {
      const s = r.byLocale[l];
      return `${String(s.published)}/${String(s.reviewed)}/${String(s.draft)}`.padEnd(17);
    };
    console.log(
      `${r.topicId.padEnd(22)}${String(r.trails).padEnd(7)}${String(r.concepts).padEnd(9)}${cell('pt-BR')}${cell('en')}`,
    );
  }
  const total = (key: 'published' | 'draft') =>
    rows.reduce((n, r) => n + r.byLocale['pt-BR'][key] + r.byLocale.en[key], 0);
  console.log(
    `\nPublished variants: ${String(total('published'))}. Review backlog (drafts): ${String(total('draft'))}.`,
  );
}
