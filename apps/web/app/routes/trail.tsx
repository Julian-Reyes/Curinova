import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { ChevronLeftIcon, TrailIcon } from '../components/icons';
import { useApp, useSavedIds, useSeen } from '../data/app-context';
import { progress } from '../data/progress';
import { FeedRail } from '../features/feed/FeedRail';
import { FeedView, type FeedApi, type FeedSlide } from '../features/feed/FeedView';
import { LessonCard } from '../features/feed/LessonCard';
import { trailHref } from '../features/feed/LessonSheets';
import { TrailEndSlide } from '../features/feed/Slides';

/**
 * Trail mode (§3.9): the feed follows one trail in order, with a visible exit back
 * to Discover. Discover's position is kept in the session, so exiting returns there.
 */
export default function Trail() {
  const { t } = useTranslation();
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const { library, prefs, reportStorageError } = useApp();
  const saved = useSavedIds();
  const { completed } = useSeen();
  const navigate = useNavigate();
  const api = useRef<FeedApi>(null);
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const cluster = library.clusterBySlug(slug, prefs.locale);
  const concepts = cluster ? library.conceptsInCluster(cluster.id) : [];
  const startParam = params.get('start');
  const [initialIndex] = useState(() => {
    const fromParam = concepts.findIndex((c) => c.id === startParam);
    if (fromParam >= 0) return fromParam;
    const firstOpen = concepts.findIndex((c) => !completed.has(c.id));
    return Math.max(0, firstOpen);
  });
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (cluster) document.title = `${cluster.title[prefs.locale]} · ${t('app.name')}`;
  }, [cluster, prefs.locale, t]);

  useEffect(() => {
    const first = concepts[initialIndex];
    if (first) progress.record('trail_started', first.id, prefs.locale).catch(reportStorageError);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per trail visit
  }, [cluster?.id]);

  // Links to another lesson of the same trail (e.g. from the side rail) scroll to it.
  useEffect(() => {
    const target = concepts.findIndex((c) => c.id === startParam);
    if (target >= 0 && target !== index) api.current?.goTo(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- react to URL changes only
  }, [startParam]);

  // Keep the visible URL on the current lesson, so reloading or sharing returns here.
  const onIndexChange = useCallback(
    (i: number) => {
      setIndex(i);
      const c = concepts[i];
      if (c && c.id !== startParam) {
        const href = trailHref(library, c.id, prefs.locale);
        if (href) void navigate(href, { replace: true, preventScrollReset: true });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cluster?.id, prefs.locale, startParam],
  );

  if (!cluster) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">{t('trail.notFound')}</h1>
        <Link
          to="/app/explore"
          className="pressable rounded-2xl bg-primary px-5 py-3 font-semibold text-on-primary"
        >
          {t('nav.explore')}
        </Link>
      </div>
    );
  }

  const slides: FeedSlide[] = concepts.flatMap((concept) => {
    const variant = library.variant(concept.id, prefs.locale);
    if (!variant) return [];
    return [
      {
        key: concept.id,
        label: variant.title,
        render: ({ active }) => (
          <LessonCard
            concept={concept}
            variant={variant}
            active={active}
            saved={saved.has(concept.id)}
            reason="trail"
            seed={seed}
            onOpened={(id) => {
              progress.record('trail_step', id, prefs.locale).catch(reportStorageError);
            }}
            onNextInTrail={(nextId) => {
              api.current?.goTo(concepts.findIndex((c) => c.id === nextId));
            }}
          />
        ),
      },
    ];
  });
  slides.push({
    key: 'trail-end',
    label: t('trail.endTitle'),
    render: () => <TrailEndSlide cluster={cluster} />,
  });

  const step = Math.min(index + 1, concepts.length);
  const header = (
    <div className="flex shrink-0 items-center gap-2 px-2.5 pt-2 lg:px-0 lg:pt-5">
      <Link
        to="/app/discover"
        className="pressable flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-surface pr-3.5 pl-1.5 text-sm font-semibold shadow-sm ring-1 ring-line hover:bg-sunken"
      >
        <ChevronLeftIcon size={20} />
        {t('trail.exit')}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-full bg-surface px-3.5 py-1.5 shadow-sm ring-1 ring-line">
        <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] font-semibold">
          <TrailIcon size={15} className="shrink-0 text-primary" />
          <span className="truncate">{cluster.title[prefs.locale]}</span>
          <span className="ml-auto shrink-0 text-muted">
            {t('trail.progress', { step, total: concepts.length })}
          </span>
        </span>
        <span className="h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <span
            className="block h-full rounded-full bg-primary transition-[width] duration-[var(--dur)]"
            style={{ width: `${(step / concepts.length) * 100}%` }}
          />
        </span>
      </div>
    </div>
  );

  return (
    <div className="feed-height">
      <FeedView
        key={cluster.id}
        apiRef={api}
        slides={slides}
        initialIndex={initialIndex}
        onIndexChange={onIndexChange}
        header={header}
        rail={(i) => <FeedRail conceptId={concepts[i]?.id} />}
      />
    </div>
  );
}
