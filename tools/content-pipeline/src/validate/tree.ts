import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

/** A content file as read from disk (or built in memory by tests). */
export interface ContentFile {
  /** Repo-relative path, used verbatim in error messages. */
  path: string;
  /** Parsed JSON, or undefined when `parseError` is set. */
  data?: unknown;
  parseError?: string;
}

/** "real" = content/ (the library). "fixtures" = content/fixtures/ (dev-only). */
export interface ContentTree {
  kind: 'real' | 'fixtures';
  /** Repo-relative root, e.g. "content" or "content/fixtures". */
  root: string;
  files: ContentFile[];
}

async function walk(dir: string, skip: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full !== skip) out.push(...(await walk(full, skip)));
    } else if (entry.name.endsWith('.json')) {
      out.push(full);
    }
  }
  return out.sort();
}

/** Reads one content tree. `drafts/` and, for the real tree, `fixtures/` are excluded. */
export async function loadTree(
  repoRoot: string,
  root: string,
  kind: ContentTree['kind'],
): Promise<ContentTree> {
  const absRoot = join(repoRoot, root);
  const skipFixtures = kind === 'real' ? join(absRoot, 'fixtures') : '';
  const paths = (await walk(absRoot, skipFixtures)).filter(
    (p) => !relative(absRoot, p).startsWith('drafts'),
  );
  const files: ContentFile[] = [];
  for (const abs of paths) {
    const path = relative(repoRoot, abs);
    const raw = await readFile(abs, 'utf8');
    try {
      files.push({ path, data: JSON.parse(raw) as unknown });
    } catch (error) {
      files.push({ path, parseError: (error as Error).message });
    }
  }
  return { kind, root, files };
}
