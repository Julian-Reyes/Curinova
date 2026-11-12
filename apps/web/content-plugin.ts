import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import type { Plugin } from 'vite';

export type ContentChannel = 'production' | 'preview' | 'fixtures';

const run = promisify(execFile);

/**
 * Runs `content:build` (tools/content-pipeline, D16) into public/content: before every
 * build, when the dev server starts, and again whenever a file under content/ changes.
 * It runs as a separate process because Vite loads this config with Node, which cannot
 * resolve the domain package's extensionless TypeScript imports.
 */
export function lumenContent(channel: ContentChannel): Plugin {
  const repoRoot = resolve(import.meta.dirname, '../..');
  const contentDir = resolve(repoRoot, 'content');
  // Drafts, review notes and the review log never reach the bundle; the review tool (D20)
  // writes them on every action, which shouldn't rebuild content or reload the page.
  const ignored = [resolve(contentDir, 'drafts'), resolve(contentDir, 'review-log.jsonl')];
  const tsx = resolve(repoRoot, 'node_modules/.bin/tsx');
  const build = async () => {
    const { stdout } = await run(
      tsx,
      ['tools/content-pipeline/src/bundle/cli.ts', `--channel=${channel}`],
      { cwd: repoRoot },
    );
    return stdout.trim();
  };
  // Link-preview images for the public pages (§7.2); unchanged ones are kept.
  const previews = async () => {
    const { stdout } = await run(tsx, ['tools/content-pipeline/src/og/cli.ts'], { cwd: repoRoot });
    return stdout.trim();
  };
  let built = false;
  return {
    name: 'lumen-content',
    async buildStart() {
      // The client and server builds both start here; one content build is enough.
      if (built) return;
      built = true;
      this.info(await build());
      if (channel !== 'fixtures') this.info(await previews());
    },
    configureServer(server) {
      server.watcher.add(contentDir);
      let timer: ReturnType<typeof setTimeout> | undefined;
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(contentDir) || ignored.some((p) => file.startsWith(p))) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          build()
            .then(() => {
              server.ws.send({ type: 'full-reload' });
            })
            .catch((error: unknown) => {
              server.config.logger.error(`content:build failed: ${String(error)}`);
            });
        }, 150);
      });
    },
  };
}
