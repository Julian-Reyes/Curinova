import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { loadTree } from '../../tools/content-pipeline/src/validate/tree.ts';

const VIRTUAL_ID = 'virtual:lumen-content';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

export type ContentChannel = 'production' | 'preview' | 'fixtures';

/**
 * Bundles the content library into one lazily loaded module (`virtual:lumen-content`).
 * Fixtures are only read when the channel is "fixtures" (tests), so they can never
 * end up in a preview or production bundle. Channel filtering by review status
 * happens in the app with the shared `selectContent()` selector.
 * The full versioned content build (`content:build`) replaces this in M3.
 */
export function lumenContent(channel: ContentChannel): Plugin {
  const repoRoot = resolve(import.meta.dirname, '../..');
  const contentDir = resolve(repoRoot, 'content');
  return {
    name: 'lumen-content',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return undefined;
      const tree =
        channel === 'fixtures'
          ? await loadTree(repoRoot, 'content/fixtures', 'fixtures')
          : await loadTree(repoRoot, 'content', 'real');
      const bucket = (re: RegExp) => tree.files.filter((f) => re.test(f.path)).map((f) => f.data);
      const library = {
        channel,
        topics: bucket(/\/topics\.json$/).flat(),
        clusters: bucket(/\/clusters\/[^/]+\.json$/),
        concepts: bucket(/\/lessons\/[^/]+\/concept\.json$/),
        variants: bucket(/\/lessons\/[^/]+\/variant\.[^.]+\.json$/),
        questions: bucket(/\/lessons\/[^/]+\/quiz\.[^.]+\.json$/).flat(),
        sources: bucket(/\/sources\/[^/]+\.json$/),
      };
      return `export default ${JSON.stringify(library)};`;
    },
    configureServer(server) {
      server.watcher.add(contentDir);
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(contentDir)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}
