import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ContentChannel } from '@lumen/domain';
import { loadTree } from '../validate/tree';
import { validateContent } from '../validate/validate';
import { buildContent, libraryFromTrees, type BuildResult } from './build';

/** D16 budget: compressed content a first visit downloads (manifest, index, media, topics). */
export const FIRST_VISIT_BUDGET_BYTES = 350 * 1024;

/**
 * Validates the content, builds the bundle for `channel` and replaces `outDir` with it.
 * Fails on content errors or when a first visit would exceed the budget (D16: then switch
 * to loading topics on demand).
 */
export async function writeContentBuild(
  repoRoot: string,
  channel: ContentChannel,
  outDir: string,
): Promise<BuildResult> {
  const tree =
    channel === 'fixtures'
      ? await loadTree(repoRoot, 'content/fixtures', 'fixtures')
      : await loadTree(repoRoot, 'content', 'real');
  const errors = validateContent([tree]).issues.filter((i) => i.severity === 'error');
  if (errors.length > 0)
    throw new Error(
      `content has ${String(errors.length)} error(s); run pnpm content:validate. First: ${errors[0]?.file ?? ''} ${errors[0]?.message ?? ''}`,
    );
  const result = buildContent(libraryFromTrees([tree]), channel);
  for (const [locale, bytes] of Object.entries(result.firstVisitGzip))
    if (bytes > FIRST_VISIT_BUDGET_BYTES)
      throw new Error(
        `first visit in ${locale} downloads ${String(Math.round(bytes / 1024))} KB of content (budget ${String(FIRST_VISIT_BUDGET_BYTES / 1024)} KB, D16): load topics on demand`,
      );
  await mkdir(outDir, { recursive: true });
  for (const name of await readdir(outDir)) await rm(join(outDir, name), { recursive: true });
  for (const [name, text] of result.files) await writeFile(join(outDir, name), text);
  return result;
}
