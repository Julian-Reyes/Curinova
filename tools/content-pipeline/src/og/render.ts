import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';

/*
 * Link-preview images (§7.2): 1200×630 JPEGs, the lesson's photo under a dark fade with the topic,
 * the question and the app name. Story images (§7.4) are the 1080×1920 version of a lesson card
 * for Instagram Stories and WhatsApp Status. Satori lays out the text as SVG; sharp puts it on
 * the photo.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

export interface PreviewInput {
  title: string;
  topic: string;
  /** Topic accent for the label, e.g. "#3fcf7a" (the bright Discover accent). */
  accent: string;
  brand: string;
  /** The lesson photo (any size; cropped to fill), or none for a plain dark card. */
  photo?: string | undefined;
  /** A credit some licenses require on the image (e.g. CC BY). */
  credit?: string | undefined;
}

const require = createRequire(import.meta.url);
const fontFile = (weight: number) =>
  require.resolve(`@fontsource/inter-tight/files/inter-tight-latin-${String(weight)}-normal.woff`);

let fonts: { name: string; data: Buffer; weight: 400 | 700 | 800; style: 'normal' }[] | undefined;
async function loadFonts() {
  fonts ??= await Promise.all(
    ([400, 700, 800] as const).map(async (weight) => ({
      name: 'Inter Tight',
      data: await readFile(fontFile(weight)),
      weight,
      style: 'normal' as const,
    })),
  );
  return fonts;
}

/** Shorter titles get bigger type, so every question fits in three lines at most. */
function titleSize(title: string): number {
  if (title.length <= 40) return 68;
  if (title.length <= 70) return 58;
  return 48;
}

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

export async function renderPreview(input: PreviewInput): Promise<Buffer> {
  const overlay = el(
    'div',
    {
      // Satori adds padding outside width and height, so the box is sized without it.
      width: OG_WIDTH - 2 * 64,
      height: OG_HEIGHT - 2 * 48,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '48px 64px',
      fontFamily: 'Inter Tight',
      color: '#ffffff',
      backgroundImage:
        'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.9) 100%)',
    },
    [
      el(
        'div',
        {
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: input.accent,
          marginBottom: 14,
        },
        input.topic,
      ),
      el(
        'div',
        {
          fontSize: titleSize(input.title),
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: -1,
          maxWidth: 1040,
        },
        input.title,
      ),
      el(
        'div',
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: 26,
          fontSize: 24,
        },
        [
          el('div', { fontWeight: 800, fontSize: 30 }, input.brand),
          el(
            'div',
            { fontWeight: 400, fontSize: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 640 },
            input.credit ?? '',
          ),
        ],
      ),
    ],
  );
  return compose(overlay, OG_WIDTH, OG_HEIGHT, input.photo);
}

export interface StoryInput extends PreviewInput {
  /** The card's short text under the title. */
  text: string;
  /** The lesson's address, printed at the bottom: the site, then the page path. */
  site: string;
  path: string;
}

function storyTitleSize(title: string): number {
  if (title.length <= 40) return 92;
  if (title.length <= 60) return 80;
  return 70;
}

/**
 * A 1080×1920 story image of a lesson card (§7.4). The text stays clear of the top 250 px and
 * bottom 340 px, where Instagram and WhatsApp draw their own controls over a story.
 */
export async function renderStory(input: StoryInput): Promise<Buffer> {
  const overlay = el(
    'div',
    {
      width: STORY_WIDTH - 2 * 80,
      height: STORY_HEIGHT - 260 - 340,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '260px 80px 340px',
      fontFamily: 'Inter Tight',
      color: '#ffffff',
      backgroundImage:
        'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0.35) 36%, rgba(0,0,0,0.85) 54%, rgba(0,0,0,0.92) 100%)',
    },
    [
      el(
        'div',
        {
          fontSize: 48,
          fontWeight: 800,
          letterSpacing: -0.5,
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
        },
        input.brand,
      ),
      el('div', { display: 'flex', flexDirection: 'column' }, [
        el(
          'div',
          {
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: input.accent,
            marginBottom: 22,
          },
          input.topic,
        ),
        el(
          'div',
          {
            fontSize: storyTitleSize(input.title),
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: -1.5,
          },
          input.title,
        ),
        el(
          'div',
          {
            fontSize: 40,
            fontWeight: 400,
            lineHeight: 1.35,
            color: 'rgba(255,255,255,0.9)',
            marginTop: 32,
          },
          input.text,
        ),
        el(
          'div',
          {
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'flex-start',
            marginTop: 44,
            padding: '18px 30px',
            borderRadius: 28,
            backgroundColor: 'rgba(255,255,255,0.14)',
          },
          [
            el('div', { fontSize: 30, fontWeight: 700 }, input.site),
            el('div', { fontSize: 24, color: 'rgba(255,255,255,0.75)', marginTop: 4 }, input.path),
          ],
        ),
        el(
          'div',
          { fontSize: 22, color: 'rgba(255,255,255,0.7)', marginTop: 20 },
          input.credit ?? '',
        ),
      ]),
    ],
  );
  return compose(overlay, STORY_WIDTH, STORY_HEIGHT, input.photo);
}

/** Draws the text layer over the photo (cropped to fill) or a plain dark background. */
async function compose(
  overlay: Node,
  width: number,
  height: number,
  photo: string | undefined,
): Promise<Buffer> {
  const svg = await satori(overlay as Parameters<typeof satori>[0], {
    width,
    height,
    fonts: await loadFonts(),
  });
  const base = photo
    ? sharp(photo).resize(width, height, { fit: 'cover', position: 'attention' })
    : sharp({
        // No photo: the app's dark ink, so the white text and the accent label stay readable.
        create: { width, height, channels: 3, background: '#17151a' },
      });
  return (
    base
      .composite([{ input: Buffer.from(svg) }])
      // JPEG keeps a photo preview around 100 KB; WhatsApp may skip images much over 300 KB.
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()
  );
}
