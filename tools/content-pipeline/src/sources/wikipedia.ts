import { USER_AGENT, type FetchLike } from './fetch';

/**
 * The external links (mostly references) of a Wikipedia article, via the free MediaWiki
 * API. Wikipedia is a pointer to primary and reference sources (§5.6), not the source.
 */
export async function wikipediaReferences(
  title: string,
  lang: 'pt' | 'en',
  fetchFn: FetchLike = fetch,
): Promise<string[]> {
  const api = new URL(`https://${lang}.wikipedia.org/w/api.php`);
  api.search = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'externallinks',
    format: 'json',
    formatversion: '2',
    redirects: '1',
  }).toString();
  const res = await fetchFn(api.href, { headers: { 'user-agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Wikipedia API: HTTP ${String(res.status)}`);
  const data = (await res.json()) as {
    parse?: { externallinks?: string[] };
    error?: { info: string };
  };
  if (data.error) throw new Error(`Wikipedia: ${data.error.info}`);
  const links = (data.parse?.externallinks ?? []).map((l) =>
    l.startsWith('//') ? `https:${l}` : l,
  );
  // Drop Wikimedia's own pages and identifier resolvers' search pages; keep the rest in order.
  return [...new Set(links)].filter(
    (l) =>
      l.startsWith('https://') &&
      !/(^https:\/\/[a-z.]*wiki[mp]edia\.org)|wikidata\.org|worldcat\.org\/search/.test(l),
  );
}
