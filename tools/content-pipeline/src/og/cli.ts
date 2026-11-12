import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BRAND,
  mediaKey,
  ogImageUrl,
  selectContent,
  type LessonImage,
  type Locale,
} from '@lumen/domain';
import { libraryFromTrees } from '../bundle/build';
import { loadTree } from '../validate/tree';
import { renderPreview } from './render';

/*
 * `content:og`: link-preview images for every public page (§7.2), written to
 * apps/web/public/og/<pt|en>/<lesson|topic|trail>/<slug>.jpg. Published content only, like
 * the pages themselves. Images whose inputs did not change are kept (cache in .cache/).
 */

const VERSION = 3;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const outDir = join(repoRoot, 'apps/web/public/og');
const cacheFile = join(repoRoot, '.cache/og.json');
const LOCALES: readonly Locale[] = ['pt-BR', 'en'];
const PHOTO_WORD: Record<Locale, string> = { 'pt-BR': 'Foto', en: 'Photo' };
const TOPIC_WORD: Record<Locale, string> = { 'pt-BR': 'Tema', en: 'Topic' };
/** Standalone pages: their slug in each language and their title on the preview. */
const PAGES = [
  { slug: { 'pt-BR': 'creditos', en: 'credits' }, title: { 'pt-BR': 'Créditos', en: 'Credits' } },
] as const;

/** The topic colour mixed toward white, so the label reads on the dark fade. */
function lighten(hex: string, amount = 0.45): string {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `#${c
    .map((v) =>
      Math.round(v + (255 - v) * amount)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** Credit only where the license asks for it on the picture (e.g. CC BY). */
function creditFor(image: LessonImage | undefined, locale: Locale): string | undefined {
  const o = image?.origin;
  if (o?.kind !== 'licensed' || !o.license.startsWith('CC BY')) return undefined;
  return `${PHOTO_WORD[locale]}: ${o.creator}${o.platform ? `, ${o.platform}` : ''} (${o.license})`;
}

interface Job {
  file: string;
  input: Parameters<typeof renderPreview>[0];
  photoHash: string | undefined;
}

const tree = await loadTree(repoRoot, 'content', 'real');
const lib = selectContent(libraryFromTrees([tree]), 'production');
const topics = new Map(lib.topics.map((t) => [t.id, t]));
const concepts = new Map(lib.concepts.map((c) => [c.id, c]));
const publicDir = join(repoRoot, 'apps/web/public');

/** A lesson's photo for previews: the wide Go Deeper one, else Discover. */
function lessonPhoto(conceptId: string) {
  const media = concepts.get(conceptId)?.media;
  const slot = media?.deeper ? 'deeper' : media?.discover ? 'discover' : undefined;
  if (!slot) return undefined;
  const file = join(publicDir, 'media', mediaKey(conceptId), `${slot}.webp`);
  return existsSync(file) ? { file, image: media?.[slot] } : undefined;
}

const jobs: Job[] = [];
for (const v of lib.variants) {
  const concept = concepts.get(v.conceptId);
  const topic = concept && topics.get(concept.topicId);
  if (!topic) continue;
  const photo = lessonPhoto(v.conceptId);
  jobs.push({
    file: ogImageUrl(v.locale, 'lesson', v.slug),
    input: {
      title: v.title,
      topic: topic.name[v.locale],
      accent: lighten(topic.accentColor),
      brand: BRAND.name,
      photo: photo?.file,
      credit: creditFor(photo?.image, v.locale),
    },
    photoHash: photo?.image?.hash,
  });
}
for (const locale of LOCALES) {
  const has = (conceptId: string) =>
    lib.variants.some((v) => v.conceptId === conceptId && v.locale === locale);
  for (const cluster of lib.clusters) {
    const topic = topics.get(cluster.topicId);
    const first = cluster.conceptIds.find(has);
    if (!topic || !first) continue;
    const photo = lessonPhoto(first);
    jobs.push({
      file: ogImageUrl(locale, 'trail', cluster.slug[locale]),
      input: {
        title: cluster.title[locale],
        topic: topic.name[locale],
        accent: lighten(topic.accentColor),
        brand: BRAND.name,
        photo: photo?.file,
        credit: creditFor(photo?.image, locale),
      },
      photoHash: photo?.image?.hash,
    });
  }
  for (const topic of lib.topics) {
    const inTopic = lib.clusters.filter((c) => c.topicId === topic.id).flatMap((c) => c.conceptIds);
    if (!inTopic.some(has)) continue;
    const file = join(publicDir, 'media/topics', `${topic.id}.webp`);
    const photo = topic.image && existsSync(file) ? file : undefined;
    jobs.push({
      file: ogImageUrl(locale, 'topic', topic.slug[locale]),
      input: {
        title: topic.name[locale],
        topic: TOPIC_WORD[locale],
        accent: lighten(topic.accentColor),
        brand: BRAND.name,
        photo,
        credit: photo ? creditFor(topic.image, locale) : undefined,
      },
      photoHash: photo ? topic.image?.hash : undefined,
    });
  }
}

for (const locale of LOCALES)
  for (const page of PAGES)
    jobs.push({
      file: ogImageUrl(locale, 'page', page.slug[locale]),
      input: { title: page.title[locale], topic: BRAND.name, accent: '#e0d6c8', brand: BRAND.name },
      photoHash: undefined,
    });

const cache: Record<string, string> = existsSync(cacheFile)
  ? (JSON.parse(await readFile(cacheFile, 'utf8')) as Record<string, string>)
  : {};
const next: Record<string, string> = {};
let made = 0;
for (const job of jobs) {
  const { photo, ...rest } = job.input;
  const key = createHash('sha1')
    .update(JSON.stringify({ VERSION, ...rest, photo: photo !== undefined, hash: job.photoHash }))
    .digest('hex');
  const target = join(publicDir, job.file);
  next[job.file] = key;
  if (cache[job.file] === key && existsSync(target)) continue;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, await renderPreview(job.input));
  made += 1;
}

// Remove previews of pages that no longer exist (unpublished or renamed).
async function prune(dir: string): Promise<void> {
  if (!existsSync(dir)) return;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await prune(path);
    else if (!(`/${relative(publicDir, path)}` in next)) await rm(path);
  }
}
await prune(outDir);
await mkdir(dirname(cacheFile), { recursive: true });
await writeFile(cacheFile, JSON.stringify(next, null, 2));
console.log(
  `content:og → apps/web/public/og, ${String(jobs.length)} previews (${String(made)} new or changed)`,
);
