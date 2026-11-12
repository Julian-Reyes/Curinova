import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';

/*
 * Link-preview images (§7.2): 1200×630 JPEGs, the lesson's photo under a dark fade with the topic,
 * the question and the app name. Satori lays out the text as SVG; sharp puts it on the photo.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

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
  const svg = await satori(overlay as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: await loadFonts(),
  });
  const base = input.photo
    ? sharp(input.photo).resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'attention' })
    : sharp({
        // No photo: the app's dark ink, so the white text and the accent label stay readable.
        create: { width: OG_WIDTH, height: OG_HEIGHT, channels: 3, background: '#17151a' },
      });
  return (
    base
      .composite([{ input: Buffer.from(svg) }])
      // JPEG keeps a photo preview around 100 KB; WhatsApp may skip images much over 300 KB.
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()
  );
}
