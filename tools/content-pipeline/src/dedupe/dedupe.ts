import type { LessonVariant, Locale } from '@lumen/domain';

/** Very common words that say nothing about a lesson's topic. */
const STOPWORDS = new Set(
  (
    'a o os as de do da dos das e em no na nos nas um uma uns umas que por para com sem se ao aos ' +
    'mais mas como ou foi ser sao tem isso essa esse ela ele eles elas seu sua seus suas ja nao ' +
    'the a an of to and in on at for with without is are was were be been it its this that these ' +
    'those as by or but not from has have had do does did why how what which who when your you'
  ).split(' '),
);

function terms(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export interface DuplicatePair {
  a: string;
  b: string;
  locale: Locale;
  similarity: number;
}

/**
 * Near-duplicate lessons per locale by TF-IDF cosine similarity of title, summary, card
 * text and takeaway (§5.7 content:dedupe; local, no AI service, D18).
 */
export function findDuplicates(variants: LessonVariant[], threshold = 0.5): DuplicatePair[] {
  const pairs: DuplicatePair[] = [];
  const locales = [...new Set(variants.map((v) => v.locale))];
  for (const locale of locales) {
    const docs = variants
      .filter((v) => v.locale === locale)
      .map((v) => ({
        id: v.conceptId,
        words: terms(
          [v.title, v.summary, v.cardText ?? '', ...v.cardBlocks.map((b) => b.text)].join(' '),
        ),
      }));
    const df = new Map<string, number>();
    for (const d of docs) for (const w of new Set(d.words)) df.set(w, (df.get(w) ?? 0) + 1);
    const vectors = docs.map((d) => {
      const tf = new Map<string, number>();
      for (const w of d.words) tf.set(w, (tf.get(w) ?? 0) + 1);
      const vec = new Map<string, number>();
      for (const [w, n] of tf)
        vec.set(w, n * Math.log((1 + docs.length) / (1 + (df.get(w) ?? 0)) + 1));
      const norm = Math.sqrt([...vec.values()].reduce((s, x) => s + x * x, 0)) || 1;
      return { id: d.id, vec, norm };
    });
    for (let i = 0; i < vectors.length; i += 1)
      for (let j = i + 1; j < vectors.length; j += 1) {
        const a = vectors[i];
        const b = vectors[j];
        if (!a || !b) continue;
        let dot = 0;
        for (const [w, x] of a.vec) dot += x * (b.vec.get(w) ?? 0);
        const similarity = dot / (a.norm * b.norm);
        if (similarity >= threshold) pairs.push({ a: a.id, b: b.id, locale, similarity });
      }
  }
  return pairs.sort((x, y) => y.similarity - x.similarity);
}
