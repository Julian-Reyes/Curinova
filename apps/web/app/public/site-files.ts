import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PUBLIC_LOCALES, type PublicLocale } from './paths.ts';
import type { SitePage } from './site-pages.ts';

/*
 * Files written after prerendering (§7.3): one sitemap per language plus an index, and
 * robots.txt. Also the build check (§16): every public page has its static HTML with the
 * tags search engines and link previews need. Loaded by react-router.config.ts.
 */

const SITEMAP_NAME: Record<PublicLocale, string> = {
  'pt-BR': 'sitemap-pt.xml',
  en: 'sitemap-en.xml',
};

const xml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function writeSiteFiles(clientDir: string, pages: SitePage[], siteUrl: string): void {
  for (const locale of PUBLIC_LOCALES) {
    const urls = pages
      .filter((p) => p.locale === locale)
      .map((p) => {
        const alternates = PUBLIC_LOCALES.flatMap((l) => {
          const href = p.alternates[l];
          return href
            ? [`    <xhtml:link rel="alternate" hreflang="${l}" href="${xml(siteUrl + href)}"/>`]
            : [];
        });
        const lastmod = p.lastModified
          ? [`    <lastmod>${p.lastModified.slice(0, 10)}</lastmod>`]
          : [];
        return [
          '  <url>',
          `    <loc>${xml(siteUrl + p.path)}</loc>`,
          ...lastmod,
          ...alternates,
          '  </url>',
        ].join('\n');
      });
    writeFileSync(
      join(clientDir, SITEMAP_NAME[locale]),
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ...urls,
        '</urlset>',
        '',
      ].join('\n'),
    );
  }
  writeFileSync(
    join(clientDir, 'sitemap.xml'),
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...PUBLIC_LOCALES.map((l) => `  <sitemap><loc>${siteUrl}/${SITEMAP_NAME[l]}</loc></sitemap>`),
      '</sitemapindex>',
      '',
    ].join('\n'),
  );
  // The app's screens are personal and thin; only the public pages are for search engines.
  writeFileSync(
    join(clientDir, 'robots.txt'),
    [
      'User-agent: *',
      'Disallow: /app/',
      'Disallow: /_review',
      '',
      `Sitemap: ${siteUrl}/sitemap.xml`,
      '',
    ].join('\n'),
  );
}

/** Problems with the prerendered pages, e.g. a missing canonical link. Empty means all good. */
export function checkPrerenderedPages(
  clientDir: string,
  pages: SitePage[],
  siteUrl: string,
): string[] {
  const problems: string[] = [];
  for (const page of pages) {
    const file = join(clientDir, page.path, 'index.html');
    if (!existsSync(file)) {
      problems.push(`${page.path}: no prerendered index.html`);
      continue;
    }
    const html = readFileSync(file, 'utf8');
    const has = (pattern: RegExp, what: string) => {
      if (!pattern.test(html)) problems.push(`${page.path}: missing ${what}`);
    };
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    has(/<title>[^<]+<\/title>/, 'title');
    has(/<meta name="description" content="[^"]+"/, 'description');
    has(new RegExp(`<link rel="canonical" href="${esc(siteUrl + page.path)}"`), 'canonical link');
    for (const l of PUBLIC_LOCALES) {
      const href = page.alternates[l];
      if (href)
        has(
          new RegExp(`<link rel="alternate" hrefLang="${l}" href="${esc(siteUrl + href)}"`, 'i'),
          `hreflang ${l}`,
        );
    }
    has(/<meta property="og:image" content="https:\/\/[^"]+"/, 'og:image');
    has(/<html lang="(pt-BR|en)"/, 'page language');
    if (page.kind === 'lesson') has(/<script type="application\/ld\+json">/, 'JSON-LD');
  }
  return problems;
}
