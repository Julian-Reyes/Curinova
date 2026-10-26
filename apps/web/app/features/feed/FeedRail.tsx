import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { CheckIcon } from '../../components/icons';
import { useApp, useSeen } from '../../data/app-context';
import { trailHref } from './LessonSheets';

/** Desktop side rail (§3.2): the active lesson's trail with progress, and related lessons. */
export function FeedRail({ conceptId }: { conceptId: string | undefined }) {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  const { seen } = useSeen();
  const concept = conceptId ? library.concept(conceptId) : undefined;
  if (!concept) return <KeyboardHint />;
  const cluster = library.cluster(concept.clusterId);
  const trail = cluster ? library.conceptsInCluster(cluster.id) : [];
  return (
    <div className="flex flex-col gap-6">
      {cluster && (
        <section className="rounded-[20px] bg-surface p-4 shadow-card ring-1 ring-line">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            {t('rail.trail')}
          </p>
          <h2 className="mt-1 font-display text-lg leading-snug font-semibold">
            {cluster.title[prefs.locale]}
          </h2>
          <ol className="mt-3 flex flex-col gap-1">
            {trail.map((c, i) => {
              const v = library.variant(c.id, prefs.locale);
              const href = trailHref(library, c.id, prefs.locale);
              const current = c.id === concept.id;
              if (!v || !href) return null;
              return (
                <li key={c.id}>
                  <Link
                    to={href}
                    aria-current={current ? 'step' : undefined}
                    className={`pressable flex items-start gap-2.5 rounded-xl px-2 py-2 text-sm hover:bg-sunken ${current ? 'bg-accent-soft font-semibold' : ''}`}
                  >
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${seen.has(c.id) ? 'bg-primary text-on-primary' : 'bg-sunken text-muted ring-1 ring-line'}`}
                    >
                      {seen.has(c.id) ? <CheckIcon size={13} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="leading-snug" lang={v.locale}>
                      {v.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      )}
      {concept.related.length > 0 && (
        <section>
          <p className="px-1 text-xs font-semibold tracking-wide text-muted uppercase">
            {t('deeper.related')}
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {concept.related.map((r) => {
              const v = library.variant(r.conceptId, prefs.locale);
              const href = trailHref(library, r.conceptId, prefs.locale);
              if (!v || !href) return null;
              return (
                <li key={r.conceptId}>
                  <Link
                    to={href}
                    className="pressable block rounded-2xl p-3 ring-1 ring-line hover:bg-surface hover:ring-primary"
                  >
                    <span className="block text-sm leading-snug font-semibold" lang={v.locale}>
                      {v.title}
                    </span>
                    <span className="mt-1 block text-[13px] text-muted">
                      {r.reason[prefs.locale] ?? r.reason.en}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <KeyboardHint />
    </div>
  );
}

function KeyboardHint() {
  const { t } = useTranslation();
  return (
    <p className="px-1 text-xs text-muted">
      <kbd className="rounded-md bg-sunken px-1.5 py-0.5 font-sans ring-1 ring-line">↑</kbd>{' '}
      <kbd className="rounded-md bg-sunken px-1.5 py-0.5 font-sans ring-1 ring-line">↓</kbd>{' '}
      {t('rail.keyboard')}
    </p>
  );
}
