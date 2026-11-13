// @vitest-environment node
import { describe, expect, it } from 'vitest';
import en from '../i18n/locales/en.json';
import ptBR from '../i18n/locales/pt-BR.json';
import { offlinePageHtml } from './offline-page';

describe('offline page for public pages (D28)', () => {
  const html = offlinePageHtml();

  it('is in both languages and links to the app', () => {
    expect(html).toContain('<section lang="pt-BR">');
    expect(html).toContain('<section lang="en">');
    expect(html).toContain(ptBR.offlinePage.title);
    expect(html).toContain(en.offlinePage.body);
    expect(html.match(/<a href="\/">/g)).toHaveLength(2);
  });

  it('loads no app code and stays out of search results', () => {
    expect(html).not.toContain('<script');
    expect(html).toContain('<meta name="robots" content="noindex">');
  });
});
