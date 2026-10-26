import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ChevronLeftIcon } from './icons';

/** Standard scrolling page with a large title, used by every tab except Discover. */
export function Page({
  title,
  subtitle,
  actions,
  back,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** Link shown above the title, e.g. back to Explore from a topic. */
  back?: { to: string; label: string };
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = `${title} · ${t('app.name')}`;
  }, [title, t]);
  return (
    <div className="glow-bg min-h-full">
      <div className="mx-auto w-full max-w-3xl px-4 pt-[calc(var(--safe-top)+20px)] pb-10 sm:px-6 lg:pt-10">
        {back !== undefined && (
          <Link
            to={back.to}
            className="pressable -mt-2 mb-2 -ml-1 inline-flex min-h-11 items-center gap-1 rounded-full pr-3 pl-0.5 text-sm font-semibold text-muted hover:text-ink"
          >
            <ChevronLeftIcon size={20} />
            {back.label}
          </Link>
        )}
        <header className="mb-6 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[32px] leading-tight font-semibold text-balance">
              {title}
            </h1>
            {subtitle !== undefined && <p className="mt-1 text-muted">{subtitle}</p>}
          </div>
          {actions}
        </header>
        <div className="page-in">{children}</div>
      </div>
    </div>
  );
}

export function Section({
  title,
  children,
  id,
  action,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
  action?: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-8 scroll-mt-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="flex-1 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[20px] bg-surface p-4 shadow-card ring-1 ring-line ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[20px] bg-surface/70 px-6 py-10 text-center ring-1 ring-line">
      <p className="font-display text-xl font-semibold">{title}</p>
      <p className="max-w-sm text-muted">{body}</p>
      {action !== undefined && <div className="mt-3">{action}</div>}
    </div>
  );
}

export const buttonPrimary =
  'pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-semibold text-on-primary hover:bg-primary-strong';
export const buttonSecondary =
  'pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-surface px-5 font-semibold text-ink ring-1 ring-line-strong hover:bg-sunken';
