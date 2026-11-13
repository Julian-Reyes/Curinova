import type { Topic } from '@lumen/domain';

/*
 * The topic glyphs of apps/web/app/components/TopicIcon.tsx as SVG files, for the chip on
 * story images. Keep the two in step when a glyph changes.
 */

const GLYPHS: Record<Topic['icon'], string> = {
  body: '<path d="M12 20.5s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.8-7.5 10.2-7.5 10.2z"/><path d="M4.5 12.5h4l1.5-3 2.5 6 1.5-3h5.5"/>',
  brain:
    '<path d="M9.5 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2 3.2 3.2 0 0 0 2.5 5.3 2.8 2.8 0 0 0 5 1V5.7a2.7 2.7 0 0 0-2.5-1.2z"/><path d="M14.5 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2 3.2 3.2 0 0 1-2.5 5.3 2.8 2.8 0 0 1-5 1"/><path d="M8.5 10.5h1.5M14 13.5h1.5"/>',
  space:
    '<circle cx="12" cy="12" r="5"/><path d="M3.2 15.8c-1.4 2.5 3.1 3.4 8.8.9s9.2-6.6 7.8-9c-.6-1-2.1-1.3-4.1-1"/><path d="M19 3.5v2M18 4.5h2"/>',
  flask:
    '<path d="M9.5 3.5h5M10.5 3.5v5.2L5 18.3a1.5 1.5 0 0 0 1.3 2.2h11.4a1.5 1.5 0 0 0 1.3-2.2l-5.5-9.6V3.5"/><path d="M7.5 14.5h9"/><circle cx="11" cy="17.5" r=".6" fill="#fff"/><circle cx="14" cy="16.6" r=".6" fill="#fff"/>',
  scroll:
    '<path d="M7 4.5h10.5a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H16v9a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 17.5v0h9v-11A2 2 0 0 0 11 4.5"/><path d="M8 9.5h4.5M8 13h4.5"/>',
  leaf: '<path d="M5 19C5 10.5 10.5 5 19.5 4.5 19 13.5 13.5 19 5 19z"/><path d="M5 19l9-9M10.5 13.5V10M10.5 13.5H14"/>',
  fixture:
    '<rect x="4.5" y="4.5" width="15" height="15" rx="3" stroke-dasharray="3 2.5"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/>',
};

/** A white topic glyph as an SVG data URL. */
export function topicIconDataUrl(icon: Topic['icon']): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[icon]}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
