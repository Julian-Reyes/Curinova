/*
 * pnpm content:sources refs <pt|en> <Wikipedia article title>   list the article's references
 * pnpm content:sources fetch <url> [url...]                       fetch, snapshot and record sources
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchSource } from './fetch';
import { storeSource } from './store';
import { wikipediaReferences } from './wikipedia';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const [command, ...args] = process.argv.slice(2);

if (command === 'refs' && (args[0] === 'pt' || args[0] === 'en') && args.length > 1) {
  const links = await wikipediaReferences(args.slice(1).join(' '), args[0]);
  console.log(links.map((l, i) => `${String(i + 1).padStart(3)}. ${l}`).join('\n') || 'No links.');
} else if (command === 'fetch' && args.length > 0) {
  let failed = 0;
  for (const url of args) {
    const result = await fetchSource(url);
    if (result.ok) {
      await storeSource(repoRoot, result.source, result.text);
      console.log(`✓ ${result.source.id}  ${result.source.title} (${result.source.publisher})`);
    } else {
      failed += 1;
      console.log(`✗ ${result.url}: ${result.reason}`);
    }
  }
  if (failed > 0) process.exitCode = 1;
} else {
  console.error(
    'Usage:\n  pnpm content:sources refs <pt|en> <Wikipedia title>\n  pnpm content:sources fetch <url> [url...]',
  );
  process.exitCode = 2;
}
