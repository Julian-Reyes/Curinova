import {
  ContentIndexSchema,
  ContentManifestSchema,
  MANIFEST_FILE,
  MediaFileSchema,
  TopicFileSchema,
  restoreMediaHashes,
  type ContentLibrary,
} from '@lumen/domain';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildLibrary, type Library } from '../data/library';

/*
 * Build-time content for the prerendered public pages (§7.1). Loaders run only while
 * prerendering (and on the dev server), reading the bundle the content build just wrote.
 * Only reviewed, published lessons appear (§7.3), whatever channel the app was built with.
 */

const CONTENT_DIR = join(process.cwd(), 'public/content');

let cached: Library | undefined;

export function publicLibrary(): Library {
  if (cached && process.env.NODE_ENV === 'production') return cached;
  const read = (name: string): unknown => JSON.parse(readFileSync(join(CONTENT_DIR, name), 'utf8'));
  const manifest = ContentManifestSchema.parse(read(MANIFEST_FILE));
  const index = restoreMediaHashes(
    ContentIndexSchema.parse(read(manifest.index)),
    MediaFileSchema.parse(read(manifest.media)),
  );
  const files = Object.values(manifest.topics)
    .flatMap((byLocale) => Object.values(byLocale))
    .map((name) => TopicFileSchema.parse(read(name)));
  const sources = new Map(files.flatMap((f) => f.sources).map((s) => [s.id, s]));
  const raw: ContentLibrary = {
    ...index,
    variants: files.flatMap((f) => f.variants),
    questions: files.flatMap((f) => f.questions),
    sources: [...sources.values()],
  };
  cached = buildLibrary(raw, 'production');
  return cached;
}
