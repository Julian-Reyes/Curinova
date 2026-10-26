import { useTranslation } from 'react-i18next';
import { Link, Outlet, redirect } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { OfflineIcon } from '../components/icons';
import { useApp, useDueReviews } from '../data/app-context';
import { db } from '../data/db';
import { SessionProvider } from '../features/feed/session';
import { useOnline } from '../hooks/useOnline';

/** First-time visitors go through onboarding first (it is skippable). */
export async function clientLoader() {
  try {
    const row = await db.settings.get('prefs');
    const onboarded =
      typeof (row?.value as { onboardedAt?: unknown } | undefined)?.onboardedAt === 'string';
    if (!onboarded) return redirect('/app/welcome');
  } catch {
    // Storage unavailable: let the learner in; a banner explains progress won't be saved.
  }
  return null;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { storageOk } = useApp();
  const due = useDueReviews();
  const online = useOnline();
  return (
    <SessionProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2 focus:shadow-card"
      >
        {t('a11y.skipToContent')}
      </a>
      <div className="app-frame min-h-dvh lg:grid lg:grid-cols-[256px_1fr]">
        <aside className="contents lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:gap-6 lg:border-r lg:border-line lg:bg-surface/60 lg:px-4 lg:py-6">
          <Link to="/app/discover" className="hidden items-center gap-2.5 px-3 lg:flex">
            <img src="/favicon.svg" alt="" width={32} height={32} className="rounded-[9px]" />
            <span className="font-display text-xl font-semibold">{t('app.name')}</span>
          </Link>
          <BottomNav badges={{ review: due.length }} />
          <p className="mt-auto hidden px-3 text-xs leading-relaxed text-muted lg:block">
            {t('app.tagline')}
          </p>
        </aside>
        <main id="main" className="min-w-0 pb-[calc(var(--nav-height)+var(--safe-bottom))] lg:pb-0">
          {(!online || !storageOk) && (
            <div
              role="status"
              className="sticky top-0 z-20 flex items-center gap-2 bg-ink px-4 py-2 pt-[calc(var(--safe-top)+8px)] text-sm text-bg"
            >
              <OfflineIcon size={18} />
              <span>{!storageOk ? t('banner.storage') : t('banner.offline')}</span>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </SessionProvider>
  );
}
