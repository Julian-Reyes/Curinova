import { describe, expect, it } from 'vitest';
import { validateContent } from '../src/validate/validate';
import { asReal, errors, fixtureWords, get, tree, validDocs, warnings } from './helpers';

type Json = Record<string, unknown>;
type Arr = Json[];
const PT = 'lessons/a1/variant.pt-BR.json';
const EN = 'lessons/a1/variant.en.json';
const QPT = 'lessons/a1/quiz.pt-BR.json';

function codes(docs: Record<string, unknown>, kind: 'real' | 'fixtures' = 'fixtures'): string[] {
  return errors(docs, kind).map((e) => e.code);
}

describe('content:validate baseline', () => {
  it('accepts a valid fixture tree with no errors', () => {
    expect(errors(validDocs())).toEqual([]);
  });

  it('accepts the same content as real (non-fixture) content', () => {
    expect(errors(asReal(validDocs()), 'real')).toEqual([]);
  });

  it('accepts an empty library', () => {
    expect(validateContent([tree({}, 'real')]).issues).toEqual([]);
  });
});

describe('schema and file errors', () => {
  it('reports invalid JSON with the file name', () => {
    const docs = validDocs();
    docs['clusters/broken.json'] = '!!Unexpected token } in JSON';
    const e = errors(docs).find((i) => i.code === 'json');
    expect(e?.file).toBe('content/fixtures/clusters/broken.json');
  });

  it('reports schema errors with the exact field path', () => {
    const docs = validDocs();
    (get<Json>(docs, PT).cardBlocks as Arr)[0] = { type: 'paragraph', text: '' };
    const e = errors(docs).find((i) => i.code === 'schema');
    expect(e).toMatchObject({ file: `content/fixtures/${PT}`, field: 'cardBlocks[0].text' });
  });

  it('rejects unknown fields (typos)', () => {
    const docs = validDocs();
    get<Json>(docs, PT).titel = 'typo';
    expect(errors(docs).some((e) => e.code === 'schema' && e.message.includes('titel'))).toBe(true);
  });

  it('rejects unexpected files and unknown locales', () => {
    const docs = validDocs();
    docs['lessons/a1/notes.json'] = {};
    docs['lessons/a1/variant.fr.json'] = {};
    expect(codes(docs)).toEqual(expect.arrayContaining(['unknown-file', 'unknown-locale']));
  });
});

describe('slugs', () => {
  it('rejects non-ASCII or non-kebab slugs', () => {
    const docs = validDocs();
    get<Json>(docs, PT).slug = 'por-que-a-lua-não-gira';
    const e = errors(docs).find((i) => i.field === 'slug');
    expect(e?.message).toMatch(/ASCII kebab-case/);
  });

  it('rejects duplicate slugs within a locale', () => {
    const docs = validDocs();
    const second = structuredClone(docs);
    for (const [k, v] of Object.entries(second)) {
      if (k.startsWith('lessons/a1/'))
        docs[k.replace('a1', 'a2')] = JSON.parse(
          JSON.stringify(v).replaceAll('a1', 'a2'),
        ) as unknown;
    }
    get<Json>(docs, 'lessons/a2/variant.pt-BR.json').slug = get<Json>(docs, PT).slug;
    (get<Json>(docs, 'clusters/fixture_cluster_a.json').conceptIds as string[]).push(
      'fixture_concept_a2',
    );
    get<Json>(docs, 'lessons/a2/concept.json').clusterOrder = 2;
    expect(
      errors(docs)
        .filter((e) => e.code === 'duplicate')
        .map((e) => e.field),
    ).toEqual(['slug']);
  });
});

describe('locales', () => {
  it('fixtures always need both locales', () => {
    const docs = validDocs();
    delete docs[EN];
    delete docs['lessons/a1/quiz.en.json'];
    expect(codes(docs)).toContain('missing-locale');
  });

  it('published real content needs both locales', () => {
    const docs = asReal(validDocs());
    delete docs[EN];
    delete docs['lessons/a1/quiz.en.json'];
    get<Json>(docs, 'lessons/a1/concept.json').variants = ['pt-BR'];
    const e = errors(docs, 'real').filter((i) => i.code === 'missing-locale');
    expect(e[0]?.message).toMatch(/published concepts need both pt-BR and en/);
  });

  it('a draft may exist in a single locale', () => {
    const docs = asReal(validDocs());
    delete docs[EN];
    delete docs['lessons/a1/quiz.en.json'];
    get<Json>(docs, 'lessons/a1/concept.json').variants = ['pt-BR'];
    Object.assign(get<Json>(docs, PT), { reviewStatus: 'draft', publicationStatus: 'draft' });
    expect(errors(docs, 'real')).toEqual([]);
  });

  it('rejects publishing one locale while the other is a draft', () => {
    const docs = asReal(validDocs());
    get<Json>(docs, EN).publicationStatus = 'draft';
    expect(codes(docs, 'real')).toContain('missing-locale');
  });

  it('rejects a variant whose locale field disagrees with its file name', () => {
    const docs = validDocs();
    get<Json>(docs, PT).locale = 'en';
    expect(codes(docs)).toContain('locale-mismatch');
  });
});

describe('word limits', () => {
  it('rejects a card body over 150 words', () => {
    const docs = validDocs();
    (get<Json>(docs, PT).cardBlocks as Arr)[0] = { type: 'paragraph', text: fixtureWords(151) };
    const e = errors(docs).find((i) => i.code === 'card-words');
    expect(e?.message).toBe(
      'card body has 151 words (allowed 80–150; the takeaway is not counted)',
    );
  });

  it('rejects a card body under 80 words', () => {
    const docs = validDocs();
    (get<Json>(docs, PT).cardBlocks as Arr)[0] = { type: 'paragraph', text: fixtureWords(79) };
    expect(codes(docs)).toContain('card-words');
  });

  it('does not count the takeaway toward the card limit, but caps it at 25 words', () => {
    const docs = validDocs();
    (get<Json>(docs, PT).cardBlocks as Arr)[0] = { type: 'paragraph', text: fixtureWords(150) };
    (get<Json>(docs, PT).cardBlocks as Arr)[1] = { type: 'takeaway', text: fixtureWords(25) };
    expect(errors(docs)).toEqual([]);
    (get<Json>(docs, PT).cardBlocks as Arr)[1] = { type: 'takeaway', text: fixtureWords(26) };
    expect(errors(docs).find((i) => i.code === 'takeaway')?.field).toBe('cardBlocks[1].text');
  });

  it('allows at most one takeaway', () => {
    const docs = validDocs();
    (get<Json>(docs, PT).cardBlocks as Arr).push({ type: 'takeaway', text: 'FIXTURE: two' });
    expect(codes(docs)).toContain('takeaway');
  });

  it('rejects a deep dive over 400 words', () => {
    const docs = validDocs();
    get<Json>(docs, PT).deepDiveBlocks = [{ type: 'paragraph', text: fixtureWords(401) }];
    expect(codes(docs)).toContain('deep-dive-words');
  });

  it('counts accented Portuguese words as single words', () => {
    const docs = validDocs();
    const text = `FIXTURE: ${'coração não é água '.repeat(37)}`.trim(); // 1 + 37*4 = 149
    (get<Json>(docs, PT).cardBlocks as Arr)[0] = { type: 'paragraph', text };
    expect(errors(docs)).toEqual([]);
  });
});

describe('quizzes', () => {
  it('needs 2–3 questions per variant', () => {
    const docs = validDocs();
    docs[QPT] = [get<Arr>(docs, QPT)[0]];
    get<Json>(docs, PT).quizIds = ['fixture_q_a1_1__pt-BR'];
    expect(codes(docs)).toContain('quiz-count');
  });

  it('needs a correctOptionId that matches exactly one option', () => {
    const docs = validDocs();
    (get<Arr>(docs, QPT)[0] as Json).correctOptionId = 'z';
    const e = errors(docs).find((i) => i.code === 'quiz-correct');
    expect(e).toMatchObject({ file: `content/fixtures/${QPT}`, field: '[0].correctOptionId' });
  });

  it('rejects duplicate option IDs (which would make two answers correct)', () => {
    const docs = validDocs();
    ((get<Arr>(docs, QPT)[0] as Json).options as Arr)[1] = { id: 'a', text: 'FIXTURE other' };
    expect(codes(docs)).toEqual(expect.arrayContaining(['quiz-options', 'quiz-correct']));
  });

  it('needs 3–4 options', () => {
    const docs = validDocs();
    ((get<Arr>(docs, QPT)[0] as Json).options as Arr).splice(2);
    expect(errors(docs).some((e) => e.code === 'schema' && e.field === '[0].options')).toBe(true);
  });

  it('needs quizIds to match the quiz file', () => {
    const docs = validDocs();
    get<Json>(docs, PT).quizIds = ['fixture_q_a1_1__pt-BR', 'fixture_q_a1_9__pt-BR'];
    expect(codes(docs)).toContain('quiz-ids');
  });

  it('needs question groups to pair across locales', () => {
    const docs = validDocs();
    (get<Arr>(docs, QPT)[1] as Json).questionGroupId = 'fixture_qg_a1_9';
    expect(codes(docs)).toContain('question-group');
  });

  it('needs claimIds that exist on the variant', () => {
    const docs = validDocs();
    (get<Arr>(docs, QPT)[0] as Json).claimIds = ['c9'];
    expect(codes(docs)).toContain('missing-ref');
  });
});

describe('claims and sources', () => {
  it('rejects a published claim with no source support', () => {
    const docs = validDocs();
    const claim = (get<Json>(docs, PT).claims as Arr)[0] as Json;
    claim.support = [];
    claim.highStakes = false;
    const e = errors(docs).find((i) => i.code === 'claim-unsupported');
    expect(e).toMatchObject({ field: 'claims[0].support' });
  });

  it('only warns about missing support on drafts', () => {
    const docs = asReal(validDocs());
    for (const p of [PT, EN]) {
      Object.assign(get<Json>(docs, p), {
        reviewStatus: 'draft',
        publicationStatus: 'draft',
        claims: [],
        sourceIds: [],
      });
    }
    for (const q of ['lessons/a1/quiz.pt-BR.json', 'lessons/a1/quiz.en.json']) {
      for (const item of get<Arr>(docs, q)) item.claimIds = [];
    }
    expect(errors(docs, 'real')).toEqual([]);
    expect(warnings(docs, 'real').map((w) => w.code)).toContain('no-claims');
  });

  it('rejects a published variant with no claims', () => {
    const docs = validDocs();
    get<Json>(docs, PT).claims = [];
    expect(codes(docs)).toContain('no-claims');
  });

  it('requires two sources from different publishers for high-stakes claims', () => {
    const docs = validDocs();
    get<Json>(docs, 'sources/fixture_src_two.json').publisher = 'FIXTURE Publisher One';
    const e = errors(docs).find((i) => i.code === 'high-stakes-sources');
    expect(e?.message).toMatch(/2 source\(s\) from 1 publisher/);
  });

  it('accepts two sources from different publishers on the same host', () => {
    const docs = validDocs();
    get<Json>(docs, 'sources/fixture_src_two.json').url =
      'https://example.invalid/fixture_src_one-other';
    expect(errors(docs)).toEqual([]);
  });

  it('rejects a support entry citing an unlisted or missing source', () => {
    const docs = validDocs();
    get<Json>(docs, PT).sourceIds = ['fixture_src_one'];
    expect(codes(docs)).toContain('source-not-listed');
    const claim = (get<Json>(docs, PT).claims as Arr)[0] as Json;
    (claim.support as Arr)[0] = { sourceId: 'fixture_src_missing', excerpt: 'x' };
    expect(codes(docs)).toContain('missing-ref');
  });

  it('blocks publication of unsupported or unapproved claims', () => {
    const docs = validDocs();
    Object.assign((get<Json>(docs, PT).claims as Arr)[0] as Json, {
      autoVerdict: 'unsupported',
      humanVerdict: 'pending',
    });
    expect(errors(docs).filter((e) => e.code === 'claim-verdict')).toHaveLength(2);
  });

  it('rejects placeholder hosts in real sources', () => {
    const docs = asReal(validDocs());
    get<Json>(docs, 'sources/src_one.json').url = 'https://example.com/page';
    expect(codes(docs, 'real')).toContain('placeholder-url');
  });
});

describe('licenses and publication state', () => {
  it('rejects a published variant with a pending license', () => {
    const docs = asReal(validDocs());
    get<Json>(docs, PT).contentLicense = 'pending';
    expect(errors(docs, 'real').find((e) => e.code === 'license')?.field).toBe('contentLicense');
  });

  it('requires creator, license and source URL for third-party images', () => {
    const docs = validDocs();
    get<Json>(docs, PT).heroMedia = {
      type: 'image',
      url: '/m.jpg',
      alt: 'FIXTURE',
      license: 'CC-BY-4.0',
      attribution: 'x',
      shareAlike: false,
    };
    const fields = errors(docs)
      .filter((e) => e.code === 'schema')
      .map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['heroMedia.creator', 'heroMedia.sourceUrl']));
  });

  it('rejects publishing an unreviewed variant', () => {
    const docs = validDocs();
    Object.assign(get<Json>(docs, PT), { reviewStatus: 'draft', reviewedBy: null });
    expect(
      errors(docs)
        .filter((e) => e.code === 'unreviewed-published')
        .map((e) => e.field),
    ).toEqual(['reviewStatus', 'reviewedBy']);
  });
});

describe('fixture isolation', () => {
  it('rejects "fixture": true outside content/fixtures', () => {
    const docs = asReal(validDocs());
    get<Json>(docs, 'lessons/a1/concept.json').fixture = true;
    expect(codes(docs, 'real')).toContain('fixture-outside-fixtures');
  });

  it('requires "fixture": true on every fixture file', () => {
    const docs = validDocs();
    delete get<Json>(docs, 'lessons/a1/concept.json').fixture;
    expect(codes(docs)).toContain('fixture-flag-missing');
  });

  it('requires fixture IDs, text and URLs to look obviously fake', () => {
    const docs = validDocs();
    get<Json>(docs, PT).title = 'Why the Moon shows one face';
    get<Json>(docs, 'sources/fixture_src_one.json').url = 'https://www.nasa.gov/moon';
    expect(codes(docs)).toEqual(expect.arrayContaining(['fixture-text-prefix', 'fixture-url']));
  });

  it('rejects real content that references fixture IDs', () => {
    const real = asReal(validDocs());
    get<Json>(real, 'lessons/a1/concept.json').topicId = 'fixture_topic_a';
    const result = validateContent([tree(real, 'real'), tree(validDocs(), 'fixtures')]);
    expect(result.issues.map((i) => i.code)).toContain('cross-tree-ref');
  });

  it('rejects the fixture ID prefix in real content', () => {
    const docs = asReal(validDocs());
    get<Json>(docs, 'lessons/a1/concept.json').id = 'fixture_concept_a1';
    expect(codes(docs, 'real')).toContain('fixture-id-in-real');
  });
});

describe('references', () => {
  it('rejects a concept whose trail position disagrees with the trail', () => {
    const docs = validDocs();
    get<Json>(docs, 'lessons/a1/concept.json').clusterOrder = 3;
    expect(errors(docs).find((e) => e.code === 'cluster-order')?.field).toBe('clusterOrder');
  });

  it('rejects related links to missing concepts', () => {
    const docs = validDocs();
    get<Json>(docs, 'lessons/a1/concept.json').related = [
      {
        conceptId: 'fixture_concept_zz',
        type: 'related',
        reason: { 'pt-BR': 'FIXTURE', en: 'FIXTURE' },
      },
    ];
    expect(codes(docs)).toContain('missing-ref');
  });
});

describe('Discover card text (D15/P8)', () => {
  it('accepts a short card text and rejects one that is too long or too short', () => {
    const docs = validDocs();
    get<Json>(docs, PT).cardText = fixtureWords(25);
    expect(codes(docs)).not.toContain('card-text-words');
    get<Json>(docs, EN).cardText = fixtureWords(45);
    get<Json>(docs, PT).cardText = fixtureWords(5);
    expect(errors(docs).filter((e) => e.code === 'card-text-words')).toHaveLength(2);
  });

  it('requires fixture card text to look obviously fake', () => {
    const docs = validDocs();
    get<Json>(docs, PT).cardText =
      'A real-looking sentence that could leak into production by mistake.';
    expect(codes(docs)).toContain('fixture-text-prefix');
  });
});

describe('lesson images (D15/P10, P11)', () => {
  const CONCEPT = 'lessons/a1/concept.json';
  const image = (overrides: Json = {}): Json => ({
    width: 1200,
    height: 700,
    alt: { 'pt-BR': 'Descrição', en: 'Description' },
    origin: { kind: 'generated', tool: 'Tool', createdBy: 'Founder', createdAt: '2026-10-27' },
    accuracyReviewedBy: 'Reviewer',
    addedAt: '2026-10-27',
    hash: '0123abcd',
    ...overrides,
  });
  const files = (...slots: string[]) =>
    new Set(slots.flatMap((s) => [`/media/a1/${s}.webp`, `/media/a1/${s}-sm.webp`]));
  const issues = (docs: Record<string, unknown>, mediaFiles?: Set<string>) =>
    validateContent([tree(docs, 'real')], mediaFiles ? { mediaFiles } : {}).issues;

  it('accepts a complete image record whose files exist', () => {
    const docs = asReal(validDocs());
    get<Json>(docs, CONCEPT).media = { deeper: image() };
    expect(issues(docs, files('deeper')).filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('rejects an image with an unknown origin or missing alt text (P11)', () => {
    const docs = asReal(validDocs());
    get<Json>(docs, CONCEPT).media = {
      deeper: image({ origin: { kind: 'unknown' }, alt: { 'pt-BR': 'Descrição' } }),
    };
    const codesFound = issues(docs).map((i) => i.code);
    expect(codesFound).toEqual(expect.arrayContaining(['media-origin', 'media-alt']));
  });

  it('requires an https source for a licensed image', () => {
    const docs = asReal(validDocs());
    get<Json>(docs, CONCEPT).media = {
      review: image({
        origin: {
          kind: 'licensed',
          creator: 'Name',
          license: 'Pexels License',
          sourceUrl: 'http://x.org',
        },
      }),
    };
    expect(issues(docs).some((i) => i.code === 'schema')).toBe(true);
  });

  it('reports missing files and stray files when the image folder is known', () => {
    const docs = asReal(validDocs());
    get<Json>(docs, CONCEPT).media = { discover: image() };
    const found = issues(docs, files('review'));
    expect(found.filter((i) => i.code === 'media-missing')).toHaveLength(2);
    expect(found.filter((i) => i.code === 'media-unused')).toHaveLength(2);
  });

  it('blocks publishing an image nobody has checked for accuracy, but only warns on drafts', () => {
    const docs = asReal(validDocs());
    get<Json>(docs, CONCEPT).media = { deeper: image({ accuracyReviewedBy: null }) };
    const published = issues(docs).find((i) => i.code === 'media-unreviewed');
    expect(published?.severity).toBe('error');
    for (const path of [PT, EN]) {
      Object.assign(get<Json>(docs, path), {
        publicationStatus: 'draft',
        reviewStatus: 'draft',
        publishedAt: null,
      });
    }
    expect(issues(docs).find((i) => i.code === 'media-unreviewed')?.severity).toBe('warning');
  });

  it('keeps images out of fixtures', () => {
    const docs = validDocs();
    get<Json>(docs, CONCEPT).media = { deeper: image() };
    expect(codes(docs)).toContain('media');
  });
});

describe('topic images', () => {
  const image = {
    width: 1200,
    height: 800,
    alt: { 'pt-BR': 'Descrição' },
    origin: { kind: 'unknown' },
    accuracyReviewedBy: null,
    addedAt: '2026-10-28',
    hash: '0123abcd',
  };
  it('needs an origin and alt text in both locales, and its files', () => {
    const docs = asReal(validDocs());
    (get<Json[]>(docs, 'topics.json')[0] as Json).image = image;
    const found = validateContent([tree(docs, 'real')], { mediaFiles: new Set() }).issues.map(
      (i) => i.code,
    );
    expect(found).toEqual(expect.arrayContaining(['media-origin', 'media-alt', 'media-missing']));
  });
});
