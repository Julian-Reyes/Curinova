import { createHash } from 'node:crypto';
import { Readability } from '@mozilla/readability';
import type { Source } from '@lumen/domain';
import { JSDOM } from 'jsdom';
import robotsParser from 'robots-parser';

/** Sent with every request. Low-volume authoring tool, never run in user requests (§5.5). */
export const USER_AGENT = 'lumen-content-pipeline/0.1 (authoring tool; low volume)';
/** Less readable text than this usually means a paywall, a login wall or an empty page. */
export const MIN_TEXT_CHARS = 400;

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export type FetchResult =
  { ok: true; source: Source; text: string } | { ok: false; url: string; reason: string };

/** Whitespace-collapsed, NFKC text: what snapshots store and excerpts are matched against. */
export function normalizeText(text: string): string {
  return text.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function snapshotHash(text: string): string {
  return `sha256:${createHash('sha256').update(text).digest('hex')}`;
}

/** A stable, readable source ID: host + path words + a short hash of the URL. */
export function sourceIdFor(url: string): string {
  const u = new URL(url);
  const words = `${u.hostname.replace(/^www\./, '')} ${u.pathname}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .split('_')
    .filter(Boolean)
    .slice(0, 6)
    .join('_');
  const hash = createHash('sha256').update(url).digest('hex').slice(0, 6);
  return `src_${words}_${hash}`;
}

function languageOf(lang: string | null): string {
  const m = /^([a-z]{2,3})(?:-([a-z]{2}))?/i.exec(lang ?? '');
  if (!m?.[1]) return 'en';
  const base = m[1].toLowerCase();
  return m[2] ? `${base}-${m[2].toUpperCase()}` : base;
}

async function allowedByRobots(url: string, fetchFn: FetchLike): Promise<boolean> {
  const robotsUrl = new URL('/robots.txt', url).href;
  try {
    const res = await fetchFn(robotsUrl, { headers: { 'user-agent': USER_AGENT } });
    if (!res.ok) return true; // no robots.txt: allowed
    return robotsParser(robotsUrl, await res.text()).isAllowed(url, USER_AGENT) !== false;
  } catch {
    return true;
  }
}

/**
 * Fetches a page for use as a source (§5.5 research): respects robots.txt, keeps only the
 * readable article text (Readability), and returns a Source record with its snapshot hash.
 * The text is for verification only and is never committed or republished (D18).
 */
export async function fetchSource(
  url: string,
  fetchFn: FetchLike = fetch,
  now: Date = new Date(),
): Promise<FetchResult> {
  const fail = (reason: string): FetchResult => ({ ok: false, url, reason });
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return fail('not a valid URL');
  }
  if (parsed.protocol !== 'https:') return fail('only https:// sources are accepted');
  if (!(await allowedByRobots(url, fetchFn))) return fail('disallowed by robots.txt');

  let res: Response;
  try {
    res = await fetchFn(url, {
      headers: { 'user-agent': USER_AGENT, accept: 'text/html' },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    return fail(`could not fetch: ${(error as Error).message}`);
  }
  if (!res.ok) return fail(`HTTP ${String(res.status)}`);
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('html')) return fail(`not an HTML page (${type || 'unknown type'})`);

  const dom = new JSDOM(await res.text(), { url: res.url || url });
  const doc = dom.window.document;
  const lang = doc.documentElement.getAttribute('lang');
  const siteName =
    doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ?? null;
  const article = new Readability(doc).parse();
  const text = normalizeText(article?.textContent ?? '');
  if (text.length < MIN_TEXT_CHARS)
    return fail(`only ${String(text.length)} characters of text (paywall or empty page?)`);

  const source: Source = {
    id: sourceIdFor(url),
    title: normalizeText(article?.title ?? '') || parsed.hostname,
    publisher: normalizeText(siteName ?? article?.siteName ?? '') || parsed.hostname,
    url,
    language: languageOf(lang),
    type: 'reference',
    accessedAt: now.toISOString(),
    snapshotHash: snapshotHash(text),
  };
  return { ok: true, source, text };
}
