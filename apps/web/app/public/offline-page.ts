import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * The page the service worker shows for a public page it can't fetch while offline (D28).
 * Plain static HTML with no app code: the app would read the address bar (the lesson's
 * URL) and try to render a page whose data never arrived. Both languages, because the
 * same file stands in for every public page. Written at build time from the locale files.
 */

/** Where the page is written and precached; also the service worker's fallback URL. */
export const OFFLINE_PAGE = 'offline.html';

interface Strings {
  title: string;
  body: string;
  openApp: string;
}

function strings(locale: 'pt-BR' | 'en'): Strings {
  const file = join(import.meta.dirname, '../i18n/locales', `${locale}.json`);
  return (JSON.parse(readFileSync(file, 'utf8')) as { offlinePage: Strings }).offlinePage;
}

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The app's light and dark tokens (styles/tokens.css).
const STYLE = `
:root{color-scheme:light dark;--bg:#fbf8f4;--ink:#17151a;--muted:#66626b;--line:rgb(23 21 26/.1)}
@media (prefers-color-scheme:dark){:root{--bg:#121114;--ink:#f3f1ee;--muted:#a19da7;--line:rgb(243 241 238/.12)}}
*{box-sizing:border-box}
body{margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:26rem;padding:32px 16px;text-align:center}
section+section{margin-top:28px;padding-top:28px;border-top:1px solid var(--line)}
h1{margin:16px 0 8px;font-size:1.6rem;line-height:1.2}
p{margin:0 0 16px;color:var(--muted)}
a{display:inline-flex;align-items:center;min-height:48px;padding:0 22px;border-radius:999px;background:var(--ink);color:var(--bg);font-weight:600;text-decoration:none}
`;

export function offlinePageHtml(): string {
  const section = (locale: 'pt-BR' | 'en') => {
    const s = strings(locale);
    return `<section lang="${locale}"><h1>${escape(s.title)}</h1><p>${escape(s.body)}</p><a href="/">${escape(s.openApp)}</a></section>`;
  };
  const title = `${strings('pt-BR').title} · ${strings('en').title}`;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>${escape(title)}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${STYLE}</style>
</head>
<body>
<main><img src="/favicon.svg" width="48" height="48" alt="">${section('pt-BR')}${section('en')}</main>
</body>
</html>
`;
}

export function writeOfflinePage(clientDir: string): void {
  writeFileSync(join(clientDir, OFFLINE_PAGE), offlinePageHtml());
}
