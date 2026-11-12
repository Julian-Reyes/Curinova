import { isLocale, type UserPreferences } from '@lumen/domain';
import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { Splash } from '../components/Splash';
import { ToastProvider } from '../components/Toast';
import { UpdatePrompt } from '../components/UpdatePrompt';
import { AppProvider, useApp } from '../data/app-context';
import { loadLibrary } from '../data/library';
import { defaultPreferences, progress } from '../data/progress';
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
  return { library: await loadLibrary(prefs.locale), prefs, storageOk };
}

export function HydrateFallback() {
  return <Splash />;
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
