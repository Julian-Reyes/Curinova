/*
 * Public page addresses (§7.1, §9.6): /pt/licao/:slug, /en/lesson/:slug and the topic and
 * trail pages. No imports, so react-router.config.ts can use it to list pages to prerender.
 * Paths end in "/" because the static host serves each page as <path>/index.html.
 */

export type PublicLocale = 'pt-BR' | 'en';
export type PublicKind = 'lesson' | 'topic' | 'trail';

const SEGMENTS = {
  'pt-BR': { prefix: 'pt', lesson: 'licao', topic: 'topico', trail: 'trilha' },
  en: { prefix: 'en', lesson: 'lesson', topic: 'topic', trail: 'trail' },
} as const;

export const PUBLIC_LOCALES: readonly PublicLocale[] = ['pt-BR', 'en'];

export function publicPath(locale: PublicLocale, kind: PublicKind, slug: string): string {
  const s = SEGMENTS[locale];
  return `/${s.prefix}/${s[kind]}/${slug}/`;
}

/** Route patterns for routes.ts, e.g. "pt/licao/:slug". */
export function publicRoutePattern(locale: PublicLocale, kind: PublicKind): string {
  const s = SEGMENTS[locale];
  return `${s.prefix}/${s[kind]}/:slug`;
}

/** The language of a public page from its path, or undefined for app and other paths. */
export function publicLocaleOf(pathname: string): PublicLocale | undefined {
  if (pathname.startsWith('/pt/')) return 'pt-BR';
  if (pathname.startsWith('/en/')) return 'en';
  return undefined;
}

/** Open Graph locale tags (og:locale). */
export const OG_LOCALE: Record<PublicLocale, string> = { 'pt-BR': 'pt_BR', en: 'en_GB' };
