import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Asks before activating a new service worker, so an update never swaps code
 * under a learner mid-session. Progress lives in IndexedDB and survives updates.
 */
export function UpdatePrompt() {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-[calc(var(--nav-height)+var(--safe-bottom)+12px)] z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink p-3 pl-4 text-bg shadow-card lg:bottom-6"
    >
      <span className="flex-1 text-sm font-medium">{t('pwa.updateAvailable')}</span>
      <button
        type="button"
        className="pressable min-h-11 rounded-xl px-3 text-sm font-medium opacity-80 hover:opacity-100"
        onClick={() => {
          setNeedRefresh(false);
        }}
      >
        {t('pwa.dismiss')}
      </button>
      <button
        type="button"
        className="pressable min-h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-[#06201c]"
        onClick={() => {
          void updateServiceWorker(true);
        }}
      >
        {t('pwa.update')}
      </button>
    </div>
  );
}
