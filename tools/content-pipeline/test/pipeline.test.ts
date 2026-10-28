import { SOURCE_ID_PATTERN, type LessonVariant } from '@lumen/domain';
import { describe, expect, it } from 'vitest';
import { checkDrafts } from '../src/drafts/check';
import { findDuplicates } from '../src/dedupe/dedupe';
import { checkLink, checkLinks } from '../src/links/check';
import { fetchSource, normalizeText, type FetchLike } from '../src/sources/fetch';
import { wikipediaReferences } from '../src/sources/wikipedia';
import { asReal, get, tree, validDocs } from './helpers';

type Json = Record<string, unknown>;

const ARTICLE = `The Moon is tidally locked to Earth. ${'It takes about 27 days to rotate once and the same to orbit Earth. '.repeat(10)}`;
const page = (body: string, lang = 'en') =>
  `<!doctype html><html lang="${lang}"><head><title>Tidal locking</title><meta property="og:site_name" content="NASA Science"></head><body><nav>Menu</nav><article><h1>Tidal locking</h1><p>${body}</p></article></body></html>`;

/** A fake network: path → response. Unknown paths are 404. */
function fakeFetch(routes: Record<string, () => Response>): FetchLike {
  return (url) => {
    const make = routes[new URL(url).pathname];
    return Promise.resolve(make ? make() : new Response('', { status: 404 }));
  };
}
const html = (body: string) => () =>
  new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
const withUrl = (res: Response, url: string) => {
  Object.defineProperty(res, 'url', { value: url });
  return res;
};

describe('content:sources fetch', () => {
  it('keeps the article text, records its hash, and makes a valid source ID', async () => {
    const r = await fetchSource(
      'https://science.nasa.gov/moon/tidal-locking',
      fakeFetch({ '/moon/tidal-locking': html(page(ARTICLE)) }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toContain('tidally locked to Earth');
    expect(r.text).not.toContain('Menu');
    expect(r.source).toMatchObject({
      publisher: 'NASA Science',
      language: 'en',
      title: 'Tidal locking',
    });
    expect(r.source.snapshotHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(r.source.id).toMatch(SOURCE_ID_PATTERN);
  });

  it('respects robots.txt, skips paywalls and non-https links', async () => {
    const robots = () => new Response('User-agent: *\nDisallow: /moon/', { status: 200 });
    const blocked = await fetchSource(
      'https://x.org/moon/a',
      fakeFetch({ '/robots.txt': robots, '/moon/a': html(page(ARTICLE)) }),
    );
    expect(blocked).toMatchObject({ ok: false, reason: 'disallowed by robots.txt' });
    const thin = await fetchSource(
      'https://x.org/a',
      fakeFetch({ '/a': html(page('Subscribe to read.')) }),
    );
    expect(thin.ok).toBe(false);
    expect((await fetchSource('http://x.org/a', fakeFetch({}))).ok).toBe(false);
  });
});

describe('content:sources refs', () => {
  it('lists an article’s external links without Wikimedia’s own pages', async () => {
    const api = () =>
      Response.json({
        parse: {
          externallinks: [
            'https://science.nasa.gov/moon',
            '//www.example.org/paper',
            'https://commons.wikimedia.org/wiki/File:Moon.jpg',
            'https://science.nasa.gov/moon',
          ],
        },
      });
    expect(
      await wikipediaReferences('Tidal locking', 'en', fakeFetch({ '/w/api.php': api })),
    ).toEqual(['https://science.nasa.gov/moon', 'https://www.example.org/paper']);
  });
});

describe('content:check-drafts', () => {
  const PT = 'lessons/a1/variant.pt-BR.json';
  const library = () => tree(asReal(validDocs()), 'real');
  const draftsOf = (variant: Json) => ({
    kind: 'real' as const,
    root: 'content/drafts',
    files: [{ path: `content/drafts/${PT}`, data: variant }],
  });
  const snapshots: Record<string, string> = {
    src_one: normalizeText('Some page text. Real excerpt one appears here.'),
    src_two: normalizeText('Other page. Real excerpt two is quoted.'),
  };
  const read = (id: string) => Promise.resolve(snapshots[id] ?? null);
  const draft = () => structuredClone(get<Json>(asReal(validDocs()), PT));

  it('passes when every excerpt is quoted from its source snapshot', async () => {
    const report = await checkDrafts(library(), draftsOf(draft()), read);
    expect(report.issues.filter((i) => i.severity === 'error')).toEqual([]);
    expect(report.verdicts.supported).toBe(1);
  });

  it('rejects an excerpt that is not in the source, a missing snapshot and an unsupported verdict', async () => {
    const v = draft();
    const claim = (v.claims as Json[])[0] as Json & { support: Json[] };
    (claim.support[0] as Json).excerpt = 'Words the source never said';
    (claim.support[1] as Json).sourceId = 'src_three';
    claim.autoVerdict = 'unsupported';
    const codes = (await checkDrafts(library(), draftsOf(v), read)).issues.map((i) => i.code);
    expect(codes).toEqual(
      expect.arrayContaining(['excerpt-not-in-source', 'missing-ref', 'claim-unsupported-verdict']),
    );
  });

  it('reports issues against the draft file, not the library copy it replaces', async () => {
    const v = draft();
    v.title = '';
    const report = await checkDrafts(library(), draftsOf(v), read);
    expect(report.issues.find((i) => i.code === 'schema')?.file).toBe(`content/drafts/${PT}`);
  });
});

describe('content:check-links', () => {
  const now = new Date('2026-10-28T12:00:00Z');
  it('fails on errors and cross-host redirects, retries refused HEAD with GET', async () => {
    const calls: string[] = [];
    const fetchFn: FetchLike = (url, init) => {
      calls.push(`${init?.method ?? 'GET'} ${url}`);
      if (url.endsWith('/gone')) return Promise.resolve(new Response('', { status: 404 }));
      if (url.endsWith('/moved'))
        return Promise.resolve(withUrl(new Response('ok'), 'https://spam.example/landing'));
      if (url.endsWith('/nohead') && init?.method === 'HEAD')
        return Promise.resolve(new Response('', { status: 405 }));
      return Promise.resolve(withUrl(new Response('ok'), url));
    };
    expect((await checkLink('https://a.org/gone', fetchFn, now)).reason).toBe('HTTP 404');
    expect((await checkLink('https://a.org/moved', fetchFn, now)).reason).toBe(
      'redirects to spam.example',
    );
    expect((await checkLink('https://a.org/nohead', fetchFn, now)).ok).toBe(true);
    expect(calls).toContain('GET https://a.org/nohead');
  });

  it('reuses results checked recently', async () => {
    let fetched = 0;
    const fetchFn: FetchLike = (url) => {
      fetched += 1;
      return Promise.resolve(withUrl(new Response('ok'), url));
    };
    const cache = {
      'https://a.org/x': {
        url: 'https://a.org/x',
        ok: true,
        status: 200,
        checkedAt: '2026-10-27T00:00:00Z',
      },
    };
    await checkLinks(['https://a.org/x', 'https://a.org/y'], cache, fetchFn, now);
    expect(fetched).toBe(1);
  });
});

describe('content:dedupe', () => {
  const variant = (conceptId: string, title: string, summary: string) =>
    ({
      conceptId,
      locale: 'en',
      title,
      summary,
      cardBlocks: [{ type: 'paragraph', text: summary }],
    }) as unknown as LessonVariant;
  it('flags near-duplicates and leaves different lessons alone', () => {
    const pairs = findDuplicates([
      variant(
        'concept_a',
        'Why does the Moon show one face?',
        'The Moon is tidally locked: one rotation per orbit.',
      ),
      variant(
        'concept_b',
        'Why do we see one face of the Moon?',
        'Tidally locked, the Moon makes one rotation per orbit.',
      ),
      variant(
        'concept_c',
        'Why does salt not make water boil faster?',
        'Salt raises the boiling point slightly.',
      ),
    ]);
    expect(pairs.map((p) => [p.a, p.b])).toEqual([['concept_a', 'concept_b']]);
  });
});
