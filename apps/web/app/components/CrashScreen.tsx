import { useEffect, useState } from 'react';
import { isRouteErrorResponse } from 'react-router';
import { applyPendingUpdate } from '../platform/sw-update';

/** The last-resort error screen (root and app layout). */
export function CrashScreen({ error }: { error: unknown }) {
  // Bilingual by design: at the root it renders outside the i18n provider.
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    if (status === 404) return;
    console.error(error);
    // An outdated app may have failed on newer content: take the new version if there is one.
    applyPendingUpdate()
      .then(setUpdating)
      .catch(() => undefined);
  }, [error, status]);
  return (
    <main className="glow-bg flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      {/* eslint-disable i18next/no-literal-string -- bilingual fallback shown when the app itself failed */}
      <h1 className="font-display text-3xl font-semibold">
        {status === 404
          ? 'Página não encontrada · Page not found'
          : 'Algo deu errado · Something went wrong'}
      </h1>
      <p className="text-muted">
        {updating
          ? 'Atualizando o app… · Updating the app…'
          : 'Seu progresso continua salvo neste aparelho. · Your progress is still saved on this device.'}
      </p>
      <a
        className="pressable mt-2 rounded-full bg-primary px-5 py-3 font-semibold text-on-primary"
        href="/"
      >
        Voltar ao início · Back to start
      </a>
      {/* eslint-enable i18next/no-literal-string */}
    </main>
  );
}
