import type { Concept } from '@lumen/domain';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { useApp } from '../data/app-context';
import { trailHref } from '../features/feed/LessonSheets';
import { BookmarkIcon, CheckIcon, ChevronRightIcon } from './icons';
import { LessonArt } from './LessonArt';

/**
 * A lesson in a list (Concept E): its picture or diagram, title and one line of detail.
 * "tall" puts the picture across the top, like a small Discover card (topic pages).
 * Opens the lesson in its trail; the trail's exit comes back to this page.
 */
export function LessonRow({
  concept,
  saved,
  seen,
  completed,
  meta,
  tall = false,
}: {
  concept: Concept;
  saved?: boolean;
  seen?: boolean;
  completed?: boolean;
  meta?: string | undefined;
  tall?: boolean;
}) {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  const { pathname } = useLocation();
  const variant = library.variant(concept.id, prefs.locale);
  const topic = library.topic(concept.topicId);
  const href = trailHref(library, concept.id, prefs.locale, pathname);
  if (!variant || !topic || !href) return null;
  const minutes = Math.max(1, Math.round(library.readingSeconds(variant) / 60));
  return (
    <Link
      to={href}
      className={`lesson-row pressable ${tall ? 'is-tall' : ''}`}
      data-topic={topic.id}
    >
      <span className="lesson-row-thumb">
        <LessonArt
          concept={concept}
          variant={variant}
          slot="thumb"
          accent={topic.accentColor}
          className="h-full w-full object-cover"
          plateClassName="lesson-row-plate"
        />
      </span>
      <span className="min-w-0 self-center">
        <span className="lesson-row-title" lang={variant.locale}>
          {variant.title}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12.5px] leading-snug text-muted">
          <span>{meta ?? topic.name[prefs.locale]}</span>
          <span aria-hidden="true">·</span>
          <span>{t('card.minutes', { count: minutes })}</span>
          {completed === true ? (
            <span className="flex items-center gap-0.5 font-semibold text-tl">
              <CheckIcon size={14} strokeWidth={2.6} />
              {t('lesson.completed')}
            </span>
          ) : seen === true ? (
            <span>· {t('lesson.seen')}</span>
          ) : null}
        </span>
      </span>
      <span className="flex items-center gap-1 self-center text-muted">
        {saved === true && (
          <span className="text-ink" role="img" aria-label={t('card.saved')}>
            <BookmarkIcon filled size={18} />
          </span>
        )}
        <ChevronRightIcon size={20} />
      </span>
    </Link>
  );
}
