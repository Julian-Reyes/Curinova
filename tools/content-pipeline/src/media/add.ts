/*
 * Adds lesson images (D15/P10, P14).
 *
 *   pnpm media:add <folder>
 *
 * Name each file in <folder> <lesson>_<slot>.<png|jpg|jpeg|webp>, where <lesson> is the
 * folder name under content/lessons/ and <slot> is:
 *   discover  the full-screen Discover card (9:16 or taller works best)
 *   deeper    the Go Deeper hero and Explore lesson card (centre-cropped to 12:7)
 *   review    the Review question image (centre-cropped to 16:9; must not give the answer away)
 * A Discover image whose subject would sit behind the title can be shifted up by a share
 * of its height: tides_discover-up20.jpg.
 * A topic's picture (Explore tile and topic page) is named topic_<topic id>, e.g.
 * topic_space.jpg; it is centre-cropped to 3:2 and recorded in content/topics.json.
 *
 * Each image is written to apps/web/public/media/<lesson>/<slot>.webp plus a 2/3-size
 * "-sm" file, and recorded in the lesson's concept.json with an unknown origin and no alt
 * text: content:validate fails until both are filled in (P11). Originals move to
 * <folder>/processed/ and never enter the repository.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MEDIA_SLOTS, mediaKey, smallWidth, type LessonImage, type MediaSlot } from '@lumen/domain';
import * as prettier from 'prettier';
import sharp from 'sharp';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const QUALITY = 80;
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const TOPIC_FILE = /^topic_([a-z0-9_]+)$/;
const TOPIC_SIZE = { width: 1200, height: 800 };
const FILE_NAME = new RegExp(`^([a-z0-9_]+)_(${MEDIA_SLOTS.join('|')})(?:-up(\\d{1,2}))?$`);

/** Output size per slot; Discover keeps a taller source's own height. */
const SIZE: Record<MediaSlot, { width: number; height: number }> = {
  discover: { width: 1024, height: 1820 },
  deeper: { width: 1200, height: 700 },
  review: { width: 1000, height: 562 },
};

const INK = '8,7,10';

/** Cuts the part of an image that falls inside the canvas, for compositing at `top`. */
async function visible(image: Buffer, height: number, top: number, canvasHeight: number) {
  const from = Math.max(0, -top);
  const to = Math.min(height, canvasHeight - top);
  if (to <= from) return null;
  const input = await sharp(image)
    .extract({ left: 0, top: from, width: SIZE.discover.width, height: to - from })
    .toBuffer();
  return { input, top: Math.max(0, top), left: 0 };
}

/**
 * Discover: a source at least as tall as 9:16 is only resized. A shorter one (square, 4:5)
 * is fitted to the width near the top, with blurred, darkened mirrors of itself above and
 * below that fade into black where the text goes. `up` (percent) fits it with its top cut
 * off by that share instead, so a low subject clears the title.
 */
async function discover(source: Buffer, up: number): Promise<{ data: Buffer; height: number }> {
  const W = SIZE.discover.width;
  const meta = await sharp(source).metadata();
  const D = Math.round((meta.height * W) / meta.width);
  if (!up && D >= SIZE.discover.height) {
    return { data: await sharp(source).resize(W, D).toBuffer(), height: D };
  }
  const H = Math.max(SIZE.discover.height, up ? 0 : D);
  const main = await sharp(source).resize(W, D).toBuffer();
  const mirror = await sharp(main)
    .flip()
    .blur(14)
    .modulate({ brightness: 0.45, saturation: 1.1 })
    .toBuffer();
  const Y = up ? -Math.round((D * up) / 100) : Math.round(Math.min(200, (H - D) * 0.35));
  const B = Y + D;
  const T = Math.max(Y + 60, 260);
  const fade = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="rgb(${INK})" stop-opacity="0.85"/>
          <stop offset="1" stop-color="rgb(${INK})" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="rgb(${INK})" stop-opacity="0"/>
          <stop offset="0.35" stop-color="rgb(${INK})" stop-opacity="0.55"/>
          <stop offset="1" stop-color="rgb(${INK})" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${T}" fill="url(#t)"/>
      <rect y="${B - 120}" width="${W}" height="600" fill="url(#b)"/>
      <rect y="${B + 480}" width="${W}" height="${Math.max(0, H - B - 480)}" fill="rgb(${INK})"/>
    </svg>`,
  );
  const layers = (
    await Promise.all([
      visible(mirror, D, Y - D, H),
      visible(mirror, D, B, H),
      visible(main, D, Y, H),
    ])
  ).filter((l) => l !== null);
  const data = await sharp({
    create: { width: W, height: H, channels: 3, background: `rgb(${INK})` },
  })
    .composite([...layers, { input: fade, top: 0, left: 0 }])
    .png()
    .toBuffer();
  return { data, height: H };
}

async function processImage(source: Buffer, slot: MediaSlot, up: number) {
  const { width } = SIZE[slot];
  let full: Buffer;
  let height: number;
  if (slot === 'discover') {
    ({ data: full, height } = await discover(source, up));
  } else {
    height = SIZE[slot].height;
    full = await sharp(source)
      .resize(width, height, { fit: 'cover', position: 'centre' })
      .toBuffer();
  }
  const sw = smallWidth(width);
  const sh = Math.round((height * sw) / width);
  return {
    width,
    height,
    full: await sharp(full).webp({ quality: QUALITY }).toBuffer(),
    small: await sharp(full).resize(sw, sh).webp({ quality: QUALITY }).toBuffer(),
  };
}

async function writeJson(path: string, value: unknown) {
  const options = (await prettier.resolveConfig(path)) ?? {};
  const json = JSON.stringify(value, null, 2);
  await writeFile(path, await prettier.format(json, { ...options, filepath: path }));
}

/** Topic picture: centre-cropped to 3:2, recorded in topics.json (origin unknown until filled in). */
async function addTopicImage(
  source: string,
  topicId: string,
  today: string,
): Promise<true | string> {
  const topicsPath = join(repoRoot, 'content/topics.json');
  const topics = JSON.parse(await readFile(topicsPath, 'utf8')) as {
    id: string;
    image?: LessonImage;
  }[];
  const topic = topics.find((t) => t.id === topicId);
  if (!topic) return `no topic "${topicId}" in content/topics.json`;
  const { width, height } = TOPIC_SIZE;
  const full = await sharp(await readFile(source))
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .toBuffer();
  const sw = smallWidth(width);
  const sh = Math.round((height * sw) / width);
  const dir = join(repoRoot, 'apps/web/public/media/topics');
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, `${topicId}.webp`),
    await sharp(full).webp({ quality: QUALITY }).toBuffer(),
  );
  await writeFile(
    join(dir, `${topicId}-sm.webp`),
    await sharp(full).resize(sw, sh).webp({ quality: QUALITY }).toBuffer(),
  );
  topic.image = {
    width,
    height,
    alt: {},
    origin: { kind: 'unknown' },
    accuracyReviewedBy: null,
    addedAt: today,
  };
  await writeJson(topicsPath, topics);
  return true;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: pnpm media:add <folder with lesson_slot images>');
    process.exitCode = 2;
    return;
  }
  const base = process.env.INIT_CWD ?? process.cwd();
  const inbox = isAbsolute(arg) ? arg : resolve(base, arg);
  const today = new Date().toISOString().slice(0, 10);
  const done: string[] = [];
  const skipped: string[] = [];

  for (const file of (await readdir(inbox)).sort()) {
    if (file.startsWith('.')) continue;
    const ext = extname(file).toLowerCase();
    if (!EXTENSIONS.has(ext)) {
      if (ext) skipped.push(`${file}: not a PNG, JPEG or WebP`);
      continue;
    }
    const topicMatch = TOPIC_FILE.exec(file.slice(0, -ext.length));
    if (topicMatch?.[1]) {
      const result = await addTopicImage(join(inbox, file), topicMatch[1], today);
      if (typeof result === 'string') {
        skipped.push(`${file}: ${result}`);
        continue;
      }
      await mkdir(join(inbox, 'processed'), { recursive: true });
      await rename(join(inbox, file), join(inbox, 'processed', `${today}_${file}`));
      done.push(`✓ ${file} → apps/web/public/media/topics/${topicMatch[1]}.webp`);
      continue;
    }
    const m = FILE_NAME.exec(file.slice(0, -ext.length));
    const [, key, slot, upText] = m ?? [];
    if (!key || !slot) {
      skipped.push(`${file}: name must be <lesson>_<discover|deeper|review>${ext}`);
      continue;
    }
    const up = Number(upText ?? 0);
    if (up && slot !== 'discover') {
      skipped.push(`${file}: -up only applies to _discover`);
      continue;
    }
    const conceptPath = join(repoRoot, 'content/lessons', key, 'concept.json');
    if (!existsSync(conceptPath)) {
      skipped.push(`${file}: no lesson "${key}" in content/lessons/`);
      continue;
    }
    const concept = JSON.parse(await readFile(conceptPath, 'utf8')) as {
      id: string;
      media?: Partial<Record<MediaSlot, LessonImage>>;
    };
    if (mediaKey(concept.id) !== key) {
      skipped.push(`${file}: lesson folder "${key}" does not match its concept ID ${concept.id}`);
      continue;
    }
    const out = await processImage(await readFile(join(inbox, file)), slot as MediaSlot, up);
    const dir = join(repoRoot, 'apps/web/public/media', key);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${slot}.webp`), out.full);
    await writeFile(join(dir, `${slot}-sm.webp`), out.small);

    // A new image needs its own origin and alt text: the old ones described another picture.
    concept.media = {
      ...concept.media,
      [slot]: {
        width: out.width,
        height: out.height,
        alt: {},
        origin: { kind: 'unknown' },
        accuracyReviewedBy: null,
        addedAt: today,
      } satisfies LessonImage,
    };
    await writeJson(conceptPath, concept);

    await mkdir(join(inbox, 'processed'), { recursive: true });
    await rename(join(inbox, file), join(inbox, 'processed', `${today}_${file}`));
    done.push(
      `✓ ${file} → apps/web/public/media/${key}/${slot}.webp (${out.width}×${out.height}, ${Math.round(out.small.length / 1024)} KB small)`,
    );
  }

  console.log(done.length ? done.join('\n') : 'No images to add.');
  if (skipped.length) console.log(`\nLeft in the folder:\n  ${skipped.join('\n  ')}`);
  if (done.length)
    console.log(
      '\nNext: fill in each new image\'s "origin" and "alt" (concept.json or topics.json); content:validate fails until you do.',
    );
}

await main();
