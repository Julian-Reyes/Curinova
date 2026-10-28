/*
 * pnpm content:sources refs <pt|en> <Wikipedia article title>   list the article's references
 * pnpm content:sources fetch <url> [url...]                       fetch, snapshot and record sources
 * pnpm content:sources refetch                                    re-create every committed source's snapshot
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchSource } from './fetch';
import { listSources, storeSource, type StoreOutcome } from './store';
import { wikipediaReferences } from './wikipedia';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const [command, ...args] = process.argv.slice(2);

const NOTE: Record<StoreOutcome, string> = {
  new: '',
  unchanged: ' (record unchanged)',
  'text-changed': ' (page text changed: hash and access date updated, check its excerpts)',
};

/** Fetches and stores each URL; returns how many failed and how many pages changed. */
async function fetchAll(urls: string[]): Promise<{ failed: number; changed: number }> {
  let failed = 0;
  let changed = 0;
  for (const url of urls) {
    const result = await fetchSource(url);
    if (result.ok) {
      const { source, outcome } = await storeSource(repoRoot, result.source, result.text);
      if (outcome === 'text-changed') changed += 1;
      console.log(`✓ ${source.id}  ${source.title} (${source.publisher})${NOTE[outcome]}`);
    } else {
      failed += 1;
      console.log(`✗ ${result.url}: ${result.reason}`);
    }
  }
  return { failed, changed };
}

if (command === 'refs' && (args[0] === 'pt' || args[0] === 'en') && args.length > 1) {
  const links = await wikipediaReferences(args.slice(1).join(' '), args[0]);
  console.log(links.map((l, i) => `${String(i + 1).padStart(3)}. ${l}`).join('\n') || 'No links.');
} else if (command === 'fetch' && args.length > 0) {
  const { failed } = await fetchAll(args);
  if (failed > 0) process.exitCode = 1;
} else if (command === 'refetch' && args.length === 0) {
  const sources = await listSources(repoRoot);
  const { failed, changed } = await fetchAll(sources.map((s) => s.url));
  console.log(
    `\n${String(sources.length)} source(s): ${String(sources.length - failed)} re-fetched, ${String(changed)} with changed text, ${String(failed)} failed.`,
  );
  if (failed > 0) process.exitCode = 1;
} else {
  console.error(
    'Usage:\n  pnpm content:sources refs <pt|en> <Wikipedia title>\n  pnpm content:sources fetch <url> [url...]\n  pnpm content:sources refetch',
  );
  process.exitCode = 2;
}
