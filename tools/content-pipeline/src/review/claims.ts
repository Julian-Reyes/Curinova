import type { LessonVariant } from '@lumen/domain';
import type { ClaimLocation } from './types';

/** Every reviewable text field of a variant, as [field path, text]. */
export function textFields(v: LessonVariant): [string, string][] {
  const out: [string, string][] = [
    ['title', v.title],
    ['hook', v.hook],
    ['summary', v.summary],
  ];
  if (v.cardText !== undefined) out.push(['cardText', v.cardText]);
  v.cardBlocks.forEach((b, i) => out.push([`cardBlocks[${String(i)}].text`, b.text]));
  v.deepDiveBlocks.forEach((b, i) => out.push([`deepDiveBlocks[${String(i)}].text`, b.text]));
  return out;
}

const STOP = new Set(
  (
    'the and that this with from are was were has have its for not but than then into also about ' +
    'more most can may one two que com uma para por dos das nos nas mais como ser são foi seu sua ' +
    'pelo pela isso esse essa ele ela não também quando'
  ).split(' '),
);

function words(text: string): Set<string> {
  return new Set(
    text
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length >= 3 && !STOP.has(w)),
  );
}

/** Sentence spans [start, end) in a text. */
function sentences(text: string): [number, number][] {
  const out: [number, number][] = [];
  const re = /[^.!?…]+(?:[.!?…]+["”’)]*|$)/gu;
  for (const m of text.matchAll(re)) {
    const raw = m[0];
    const lead = raw.length - raw.trimStart().length;
    const start = m.index + lead;
    const end = m.index + raw.trimEnd().length;
    if (end > start) out.push([start, end]);
  }
  return out;
}

/**
 * Claims don't record where they sit in the prose, so each claim is placed on the sentence
 * that shares the most words with it (at least a third of the claim's words). Card and Go
 * Deeper text win ties over the title, hook and summary. Claims with no good match are left
 * unplaced and only appear in the claim list.
 */
export function locateClaims(v: LessonVariant): ClaimLocation[] {
  const spans = textFields(v)
    .sort(
      ([a], [b]) =>
        Number(/^(title|hook|summary)$/.test(a)) - Number(/^(title|hook|summary)$/.test(b)),
    )
    .flatMap(([field, text]) =>
      sentences(text).map(([start, end]) => ({
        field,
        start,
        end,
        words: words(text.slice(start, end)),
      })),
    );
  const out: ClaimLocation[] = [];
  for (const claim of v.claims) {
    const cw = words(claim.text);
    if (cw.size === 0) continue;
    let best: (typeof spans)[number] | undefined;
    let bestScore = 0;
    for (const s of spans) {
      let shared = 0;
      for (const w of cw) if (s.words.has(w)) shared += 1;
      const score = shared / cw.size;
      if (score > bestScore) {
        best = s;
        bestScore = score;
      }
    }
    if (best && bestScore >= 1 / 3)
      out.push({ claimId: claim.id, field: best.field, start: best.start, end: best.end });
  }
  return out;
}
