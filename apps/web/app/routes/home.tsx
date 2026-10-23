import { LOCALES, type Locale, type Theme } from '@lumen/domain';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomNav } from '../components/BottomNav';
import { GlobeIcon, MoonIcon, SparkIcon, SunIcon, SystemIcon } from '../components/icons';
import { Segmented } from '../components/Segmented';
import { UpdatePrompt } from '../components/UpdatePrompt';
import { readStorage, STORAGE_KEYS, writeStorage } from '../platform/storage-keys';
import { applyTheme, watchSystemTheme } from '../platform/theme';

/** Client-only: the language is chosen in the browser, so prerender a neutral splash. */
export function clientLoader() {
  return null;
}

export function HydrateFallback() {
  return <div className="glow-bg min-h-dvh" aria-hidden="true" />;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = readStorage(STORAGE_KEYS.theme);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  });

  useEffect(() => {
    applyTheme(theme);
    return watchSystemTheme(theme);
  }, [theme]);

  const setLocale = (locale: Locale) => {
    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    writeStorage(STORAGE_KEYS.locale, locale);
  };

  return (
    <div className="glow-bg min-h-dvh pt-[var(--safe-top)] pb-[calc(var(--nav-height)+var(--safe-bottom))]">
      <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-8">
        <header className="flex items-center gap-2">
          <SparkIcon className="text-primary" />
          <span className="font-display text-xl font-semibold">{t('app.name')}</span>
        </header>
        <section className="flex flex-col gap-3">
          <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-ink">
            {t('shell.status')}
          </span>
          <h1 className="font-display text-4xl leading-tight font-semibold text-balance">
            {t('shell.title')}
          </h1>
          <p className="text-lg text-muted">{t('app.tagline')}</p>
          <p className="text-muted">{t('shell.body')}</p>
        </section>
        <section className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-card ring-1 ring-line">
          <Segmented<Locale>
            label={t('settings.language')}
            options={LOCALES.map((l) => ({
              value: l,
              label: t(`language.${l}`),
              icon: <GlobeIcon size={18} />,
            }))}
            value={i18n.language === 'en' ? 'en' : 'pt-BR'}
            onChange={setLocale}
          />
          <Segmented<Theme>
            label={t('settings.theme')}
            options={[
              { value: 'system', label: t('theme.system'), icon: <SystemIcon size={18} /> },
              { value: 'light', label: t('theme.light'), icon: <SunIcon size={18} /> },
              { value: 'dark', label: t('theme.dark'), icon: <MoonIcon size={18} /> },
            ]}
            value={theme}
            onChange={setTheme}
          />
        </section>
      </main>
      <BottomNav enabled={false} />
      <UpdatePrompt />
    </div>
  );
}
