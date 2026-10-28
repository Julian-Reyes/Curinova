import { BRAND, isLocale } from '@lumen/domain';
import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from 'react-router';
import type { Route } from './+types/root';
import { createI18n } from './i18n';
import { BOOT_SCRIPT } from './platform/storage-keys';
import './styles/app.css';

export const meta: Route.MetaFunction = () => [
  { title: BRAND.name },
  {
    name: 'description',
    content:
      'Scroll with curiosity. Leave with knowledge. · Role com curiosidade. Saia sabendo mais.',
  },
];

export const links: Route.LinksFunction = () => [
  { rel: 'manifest', href: '/manifest.webmanifest' },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#FBF8F4" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#121114" media="(prefers-color-scheme: dark)" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={BRAND.shortName} />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [i18n] = useState(() => {
    const lang = typeof document === 'undefined' ? undefined : document.documentElement.lang;
    return createI18n(isLocale(lang) ? lang : undefined);
  });
  return (
    <I18nextProvider i18n={i18n}>
      <Outlet />
    </I18nextProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Rendered outside the i18n provider, so it is bilingual by design.
  const status = isRouteErrorResponse(error) ? error.status : 500;
  return (
    <main className="glow-bg flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      {/* eslint-disable i18next/no-literal-string -- bilingual fallback shown when the app itself failed */}
      <h1 className="font-display text-3xl font-semibold">
        {status === 404
          ? 'Página não encontrada · Page not found'
          : 'Algo deu errado · Something went wrong'}
      </h1>
      <p className="text-muted">
        Seu progresso continua salvo neste aparelho. · Your progress is still saved on this device.
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
