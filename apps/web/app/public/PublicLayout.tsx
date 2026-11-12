import { useTranslation } from 'react-i18next';
import type { PageHead } from './pages';
import { PUBLIC_LOCALES, type PublicLocale } from './paths';

/** Translations in the page's own language, whatever language the app is set to. */
export function usePublicT(locale: PublicLocale) {
  const { i18n } = useTranslation();
  return i18n.getFixedT(locale);
}

/** Header and footer of the public pages. Plain links, so everything works without JavaScript. */
export function PublicLayout({ head, children }: { head: PageHead; children: React.ReactNode }) {
  const t = usePublicT(head.locale);
  const other = PUBLIC_LOCALES.find((l) => l !== head.locale);
  const otherHref = other ? head.alternates[other] : undefined;
  return (
    <div className="pub-page glow-bg">
      <header className="pub-header">
        <a href="/" className="pub-brand">
          <img src="/favicon.svg" width={28} height={28} alt="" />
          {t('app.name')}
        </a>
        {other && otherHref && (
          <a href={otherHref} hrefLang={other} lang={other} className="pub-lang">
            {t('public.otherLanguage')}
          </a>
        )}
      </header>
      <main className="pub-main">{children}</main>
      <footer className="pub-footer">
        <p className="pub-brand-line">
          <strong>{t('app.name')}</strong> · {t('app.tagline')}
        </p>
        <p>
          <a href="/">{t('public.openApp')}</a>
        </p>
      </footer>
    </div>
  );
}
