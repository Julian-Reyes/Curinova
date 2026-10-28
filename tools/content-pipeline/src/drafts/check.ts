import { LessonVariantSchema } from '@lumen/domain';
import { normalizeText } from '../sources/fetch';
import type { ContentTree } from '../validate/tree';
import { validateContent, type Issue } from '../validate/validate';

export interface DraftReport {
  issues: Issue[];
  /** Claims in drafts by verifier verdict (pending = not verified yet). */
  verdicts: Record<'pending' | 'supported' | 'partial' | 'unsupported', number>;
  variants: number;
}

const matchable = (text: string) =>
  normalizeText(text).toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

/**
 * Checks drafts (content/drafts/, same layout as content/) the way they will be published:
 * merged over the library (a draft replaces the file it shadows), run through the content
 * validator, and every claim's excerpt matched against its local source snapshot (D18).
 */
export async function checkDrafts(
  library: ContentTree,
  drafts: ContentTree,
  readSnapshot: (sourceId: string) => Promise<string | null>,
): Promise<DraftReport> {
  const rel = (path: string, root: string) => path.slice(root.length + 1);
  const draftRels = new Set(drafts.files.map((f) => rel(f.path, drafts.root)));
  const merged: ContentTree = {
    kind: 'real',
    root: library.root,
    files: [
      ...library.files.filter((f) => !draftRels.has(rel(f.path, library.root))),
      ...drafts.files.map((f) => ({ ...f, path: `${library.root}/${rel(f.path, drafts.root)}` })),
    ],
  };
  const isDraft = (path: string) => draftRels.has(rel(path, library.root));
  const toDraftPath = (path: string) =>
    isDraft(path) ? `${drafts.root}/${rel(path, library.root)}` : path;

  const issues = validateContent([merged]).issues.map((i) => ({ ...i, file: toDraftPath(i.file) }));
  const verdicts: DraftReport['verdicts'] = {
    pending: 0,
    supported: 0,
    partial: 0,
    unsupported: 0,
  };
  let variants = 0;

  for (const file of drafts.files) {
    if (!/\/variant\.[^.]+\.json$/.test(file.path)) continue;
    const parsed = LessonVariantSchema.safeParse(file.data);
    if (!parsed.success) continue; // already reported by the validator
    variants += 1;
    for (const [i, claim] of parsed.data.claims.entries()) {
      verdicts[claim.autoVerdict] += 1;
      if (claim.autoVerdict === 'unsupported')
        issues.push({
          severity: 'error',
          code: 'claim-unsupported-verdict',
          file: file.path,
          field: `claims[${String(i)}]`,
          message: `the verifier marked claim "${claim.id}" unsupported; fix or remove it`,
        });
      for (const [j, s] of claim.support.entries()) {
        const at = `claims[${String(i)}].support[${String(j)}]`;
        const snapshot = await readSnapshot(s.sourceId);
        if (snapshot === null)
          issues.push({
            severity: 'error',
            code: 'snapshot-missing',
            file: file.path,
            field: at,
            message: `no local snapshot for ${s.sourceId}; fetch it with pnpm content:sources fetch`,
          });
        else if (!matchable(snapshot).includes(matchable(s.excerpt)))
          issues.push({
            severity: 'error',
            code: 'excerpt-not-in-source',
            file: file.path,
            field: `${at}.excerpt`,
            message: `excerpt does not appear in ${s.sourceId}; quote the source exactly`,
          });
      }
    }
  }
  return { issues, verdicts, variants };
}
