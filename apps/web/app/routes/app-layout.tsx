import { isLocale, type UserPreferences } from '@lumen/domain';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { data, isRouteErrorResponse, Outlet } from 'react-router';
import { CrashScreen } from '../components/CrashScreen';
import { OfflineIcon } from '../components/icons';
import { buttonPrimary } from '../components/Page';
import { Splash } from '../components/Splash';
import { ToastProvider } from '../components/Toast';
import { UpdatePrompt } from '../components/UpdatePrompt';
import { AppProvider, useApp } from '../data/app-context';
import { loadLibrary } from '../data/library';
import {
  controlledAtLoad,
  currentConnection,
  photosAllowed,
  saveForOffline,
  whenControlled,
} from '../data/offline';
import { defaultPreferences, progress } from '../data/progress';
import { useOnline } from '../hooks/useOnline';
import { analyticsAllowed, analyticsSink, toAnalyticsEvent } from '../platform/analytics';
import { readStorage, STORAGE_KEYS } from '../platform/storage-keys';
import type { Route } from './+types/app-layout';

export async function clientLoader() {
  const lang = document.documentElement.lang;
  const theme = readStorage(STORAGE_KEYS.theme);
  const fallback: UserPreferences = {
    ...defaultPreferences(isLocale(lang) ? lang : 'pt-BR'),
    theme: theme === 'light' || theme === 'dark' ? theme : 'system',
  };
  let prefs = fallback;
  let storageOk = true;
  try {
    prefs = await progress.loadPreferences(fallback);
  } catch {
    storageOk = false;
  }
  // Content in the learner's language only (D16); switching language loads the other.
  try {
    return { library: await loadLibrary(prefs.locale), prefs, storageOk };
  } catch {
    // Offline before this device saved any lessons, or the server failed.
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router's idiom for an error response
    throw data(CONTENT_UNAVAILABLE, { status: 503 });
  }
}

const CONTENT_UNAVAILABLE = 'content-unavailable';

export function HydrateFallback() {
  return <Splash />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.data === CONTENT_UNAVAILABLE)
    return <ContentUnavailable />;
  return <CrashScreen error={error} />;
}

/** The lessons couldn't load (D28): says why, and tries again once the connection is back. */
function ContentUnavailable() {
  const { t } = useTranslation();
  const online = useOnline();
  useEffect(() => {
    const retry = () => {
      window.location.reload();
    };
    window.addEventListener('online', retry);
    return () => {
      window.removeEventListener('online', retry);
    };
  }, []);
  return (
    <main className="glow-bg flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <OfflineIcon size={32} className="text-muted" />
      <h1 className="font-display text-3xl font-semibold">
        {online ? t('unavailable.title') : t('unavailable.offlineTitle')}
      </h1>
      <p className="max-w-sm text-muted">
        {online ? t('unavailable.body') : t('unavailable.offlineBody')}
      </p>
      <button
        type="button"
        className={`${buttonPrimary} mt-2`}
        onClick={() => {
          window.location.reload();
        }}
      >
        {t('unavailable.retry')}
      </button>
    </main>
  );
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <AppProvider
      library={loaderData.library}
      initialPrefs={loaderData.prefs}
      initialStorageOk={loaderData.storageOk}
    >
      <ToastProvider>
        <Outlet />
        <UpdatePrompt />
        <Analytics />
        <OfflineSaver />
      </ToastProvider>
    </AppProvider>
  );
}

/** Sends allowlisted, anonymous events to the analytics provider, if one is connected (D26). */
function Analytics() {
  const { library, prefs } = useApp();
  useEffect(() => {
    const sink = analyticsSink;
    if (sink === null || !analyticsAllowed(prefs)) return;
    return progress.onEvent((event) => {
      const e = toAnalyticsEvent(event, (id) => library.concept(id)?.topicId);
      if (e) sink.send(e);
    });
  }, [library, prefs]);
  return null;
}

/** Saves the content and, after onboarding, the starter pack's photos for offline use (D28). */
function OfflineSaver() {
  const { library, prefs } = useApp();
  const photos =
    prefs.onboardedAt !== null && photosAllowed(prefs.offlineDownload, currentConnection());
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    // A few seconds in, so the first cards get the network to themselves.
    const timer = setTimeout(() => {
      void whenControlled(navigator.serviceWorker, signal).then((controlled) => {
        if (!controlled || !navigator.onLine) return;
        return saveForOffline(library, { content: !controlledAtLoad, photos, signal });
      });
    }, 3000);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [library, photos]);
  return null;
}
