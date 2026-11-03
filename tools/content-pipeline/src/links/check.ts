import { USER_AGENT, type FetchLike } from '../sources/fetch';

export interface LinkResult {
  url: string;
  ok: boolean;
  status: number | null;
  reason?: string;
  checkedAt: string;
}

const host = (url: string) => new URL(url).hostname.replace(/^www\./, '');

/** One link (§5.7 content:check-links): fails on 4xx/5xx, network errors, or a redirect to another host. */
export async function checkLink(url: string, fetchFn: FetchLike, now: Date): Promise<LinkResult> {
  const base = { url, checkedAt: now.toISOString() };
  try {
    let res = await fetchFn(url, {
      method: 'HEAD',
      headers: { 'user-agent': USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    // Some servers refuse HEAD; ask again with GET before calling the link broken.
    if (res.status === 405 || res.status === 403)
      res = await fetchFn(url, {
        headers: { 'user-agent': USER_AGENT },
        signal: AbortSignal.timeout(15_000),
      });
    if (!res.ok)
      return { ...base, ok: false, status: res.status, reason: `HTTP ${String(res.status)}` };
    const finalUrl = res.url || url;
    if (host(finalUrl) !== host(url))
      return { ...base, ok: false, status: res.status, reason: `redirects to ${host(finalUrl)}` };
    return { ...base, ok: true, status: res.status };
  } catch (error) {
    return { ...base, ok: false, status: null, reason: (error as Error).message };
  }
}

/** Checks links not checked successfully within `maxAgeDays` (results cached between runs). */
export async function checkLinks(
  urls: string[],
  cache: Record<string, LinkResult>,
  fetchFn: FetchLike,
  now: Date,
  maxAgeDays = 7,
): Promise<LinkResult[]> {
  const fresh = (r: LinkResult | undefined) =>
    r?.ok === true && now.getTime() - new Date(r.checkedAt).getTime() < maxAgeDays * 86_400_000;
  const results: LinkResult[] = [];
  for (const url of [...new Set(urls)]) {
    const cached = cache[url];
    results.push(cached && fresh(cached) ? cached : await checkLink(url, fetchFn, now));
  }
  return results;
}
