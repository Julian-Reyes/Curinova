// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/* WCAG AA contrast for every text/background pair we use, in both themes (§8). */
const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  const entries = [...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(
    (m): [string, string] => [m[1] ?? '', m[2] ?? ''],
  );
  return Object.fromEntries(entries);
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT_PAIRS: [text: string, background: string][] = [
  ['ink', 'bg'],
  ['ink', 'surface'],
  ['ink', 'surface-2'],
  ['ink', 'surface-sunken'],
  ['ink', 'accent-soft'],
  ['ink-soft', 'bg'],
  ['ink-soft', 'surface'],
  ['ink-soft', 'surface-2'],
  ['muted', 'bg'],
  ['muted', 'surface'],
  ['muted', 'surface-sunken'],
  ['primary', 'bg'],
  ['primary', 'surface'],
  ['primary-strong', 'accent-soft'],
  ['on-primary', 'primary'],
  ['on-primary', 'primary-strong'],
  ['success', 'surface'],
  ['success', 'success-soft'],
  ['danger', 'surface'],
  ['danger', 'danger-soft'],
];

describe.each([
  ['light', block(":root,\n[data-theme='light']")],
  ['dark', block("[data-theme='dark']")],
])('%s theme', (_name, tokens) => {
  it.each(TEXT_PAIRS)('%s on %s meets WCAG AA (4.5:1)', (text, background) => {
    const fg = tokens[text];
    const bg = tokens[background];
    expect(fg, `--${text} defined`).toBeDefined();
    expect(bg, `--${background} defined`).toBeDefined();
    expect(contrast(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
  });
});

it('the accent is too light for text on light surfaces (decorative only)', () => {
  const light = block(":root,\n[data-theme='light']");
  expect(contrast(light.accent!, light.surface!)).toBeLessThan(4.5);
});

/*
 * Topic accents: --tl is used for text and marks on page surfaces, ink sits on the --tbg
 * tint (takeaways, review answers), and --tc is used on the always-dark Discover card.
 */
const TOPICS = ['body', 'brain', 'space', 'everyday_science', 'history'];
const DISCOVER_BG = '#000000';

describe.each(TOPICS)('topic %s', (topic) => {
  const light = block(":root,\n[data-theme='light']");
  const dark = block("[data-theme='dark'] {");
  const lt = block(`[data-topic='${topic}'] {`);
  const dt = block(`[data-theme='dark'] [data-topic='${topic}'],`);

  it('light: accent text on the page and card, ink on the tint', () => {
    expect(contrast(lt.tl!, light.bg!)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(lt.tl!, light.surface!)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(light.ink!, lt.tbg!)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(light['ink-soft']!, lt.tbg!)).toBeGreaterThanOrEqual(4.5);
    // Review answers sit on the tint: right/wrong labels and muted text.
    for (const text of ['success', 'danger', 'muted'])
      expect(contrast(light[text]!, lt.tbg!), `${text} on tint`).toBeGreaterThanOrEqual(4.5);
  });

  it('dark: accent text on the page and card, ink on the tint', () => {
    expect(contrast(dt.tl!, dark.bg!)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(dt.tl!, dark.surface!)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(dark.ink!, dt.tbg!)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(dark['ink-soft']!, dt.tbg!)).toBeGreaterThanOrEqual(4.5);
    for (const text of ['success', 'danger', 'muted'])
      expect(contrast(dark[text]!, dt.tbg!), `${text} on tint`).toBeGreaterThanOrEqual(4.5);
  });

  it('Discover: the bright accent stands out on the dark card (3:1, non-text)', () => {
    expect(contrast(lt.tc!, DISCOVER_BG)).toBeGreaterThanOrEqual(3);
  });
});
