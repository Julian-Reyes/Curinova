/*
 * Recovery from a crash caused by an outdated app (§9.2). Content is fetched fresh, but the
 * app's code stays in the service worker's cache until the learner accepts an update. If new
 * content needs newer code (a new topic icon, say), the old code fails and its error screen
 * hides the update prompt. The error screen calls this to take the new version, if any.
 */

/**
 * Activates a newer service worker if one exists or arrives, then reloads the page into it.
 * Resolves true when an update is on its way (the page will reload), false when there is none.
 */
export async function applyPendingUpdate(
  sw: ServiceWorkerContainer | undefined = typeof navigator === 'undefined'
    ? undefined
    : navigator.serviceWorker,
  reload: () => void = () => {
    window.location.reload();
  },
): Promise<boolean> {
  const registration = await sw?.getRegistration();
  if (!sw || !registration) return false;
  if (!registration.waiting && !registration.installing) {
    await registration.update().catch(() => undefined);
  }
  const worker = registration.waiting ?? registration.installing;
  if (!worker) return false;
  sw.addEventListener('controllerchange', reload, { once: true });
  const activate = () => {
    // The generated service worker skips waiting on this message (vite-plugin-pwa, prompt mode).
    worker.postMessage({ type: 'SKIP_WAITING' });
  };
  if (worker.state === 'installed') activate();
  else
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') activate();
    });
  return true;
}
