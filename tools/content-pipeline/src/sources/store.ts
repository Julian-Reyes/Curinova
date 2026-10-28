import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Source } from '@lumen/domain';
import * as prettier from 'prettier';

/** Snapshots are local only (gitignored, D18): the repository is public. */
export const SNAPSHOT_DIR = 'content/sources/.snapshots';

export function snapshotPath(repoRoot: string, sourceId: string): string {
  return join(repoRoot, SNAPSHOT_DIR, `${sourceId}.txt`);
}

export async function readSnapshot(repoRoot: string, sourceId: string): Promise<string | null> {
  const path = snapshotPath(repoRoot, sourceId);
  return existsSync(path) ? readFile(path, 'utf8') : null;
}

/** Writes the source record (committed) and its text snapshot (local only). */
export async function storeSource(repoRoot: string, source: Source, text: string): Promise<void> {
  await mkdir(join(repoRoot, SNAPSHOT_DIR), { recursive: true });
  await writeFile(snapshotPath(repoRoot, source.id), text);
  const path = join(repoRoot, 'content/sources', `${source.id}.json`);
  const options = (await prettier.resolveConfig(path)) ?? {};
  await writeFile(
    path,
    await prettier.format(JSON.stringify(source, null, 2), { ...options, filepath: path }),
  );
}
