import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SourceSchema, type Source } from '@lumen/domain';
import * as prettier from 'prettier';

/** Snapshots are local only (gitignored, D18): the repository is public. */
export const SNAPSHOT_DIR = 'content/sources/.snapshots';
export const SOURCES_DIR = 'content/sources';

export function snapshotPath(repoRoot: string, sourceId: string): string {
  return join(repoRoot, SNAPSHOT_DIR, `${sourceId}.txt`);
}

function recordPath(repoRoot: string, sourceId: string): string {
  return join(repoRoot, SOURCES_DIR, `${sourceId}.json`);
}

export async function readSnapshot(repoRoot: string, sourceId: string): Promise<string | null> {
  const path = snapshotPath(repoRoot, sourceId);
  return existsSync(path) ? readFile(path, 'utf8') : null;
}

/** The committed source record for an ID, or null if there is none. */
export async function readSource(repoRoot: string, sourceId: string): Promise<Source | null> {
  const path = recordPath(repoRoot, sourceId);
  return existsSync(path) ? SourceSchema.parse(JSON.parse(await readFile(path, 'utf8'))) : null;
}

/** Every committed source record (content/sources/*.json). */
export async function listSources(repoRoot: string): Promise<Source[]> {
  const dir = join(repoRoot, SOURCES_DIR);
  const names = (await readdir(dir)).filter((n) => n.endsWith('.json')).sort();
  return Promise.all(
    names.map(async (n) => SourceSchema.parse(JSON.parse(await readFile(join(dir, n), 'utf8')))),
  );
}

export type StoreOutcome = 'new' | 'unchanged' | 'text-changed';

/**
 * Merges a fresh fetch into an existing record. The writer curates `publisher`, `type` and
 * `license` (WRITER.md §2), so a re-fetch never overwrites them. If the page text is the same,
 * the record is kept as it is (including `accessedAt`); if it changed, the fetched title,
 * language, access date and hash are taken and the curated fields are kept.
 */
export function mergeSource(
  existing: Source | null,
  fetched: Source,
): { source: Source; outcome: StoreOutcome } {
  if (!existing) return { source: fetched, outcome: 'new' };
  if (existing.snapshotHash === fetched.snapshotHash)
    return { source: existing, outcome: 'unchanged' };
  const { title, language, accessedAt, snapshotHash } = fetched;
  return {
    source: { ...existing, title, language, accessedAt, snapshotHash },
    outcome: 'text-changed',
  };
}

/** Writes the text snapshot (local only) and the merged source record (committed); returns the record as stored. */
export async function storeSource(
  repoRoot: string,
  fetched: Source,
  text: string,
): Promise<{ source: Source; outcome: StoreOutcome }> {
  await mkdir(join(repoRoot, SNAPSHOT_DIR), { recursive: true });
  await writeFile(snapshotPath(repoRoot, fetched.id), text);
  const { source, outcome } = mergeSource(await readSource(repoRoot, fetched.id), fetched);
  if (outcome === 'unchanged') return { source, outcome };
  const path = recordPath(repoRoot, source.id);
  const options = (await prettier.resolveConfig(path)) ?? {};
  await writeFile(
    path,
    await prettier.format(JSON.stringify(source, null, 2), { ...options, filepath: path }),
  );
  return { source, outcome };
}
