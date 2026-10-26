import type { Concept } from '@lumen/domain';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useApp } from '../data/app-context';
import { trailHref } from '../features/feed/LessonSheets';
import { BookmarkIcon, CheckIcon } from './icons';
import { TopicIcon, topicTint } from './TopicIcon';

/** A lesson in a list; opens it in trail mode. */
export function LessonRow({
  concept,
  saved,
  seen,
  completed,
  meta,
}: {
  concept: Concept;
  saved?: boolean;
  seen?: boolean;
  completed?: boolean;
  meta?: string | undefined;
}) {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  const variant = library.variant(concept.id, prefs.locale);
  const topic = library.topic(concept.topicId);
  const href = trailHref(library, concept.id, prefs.locale);
  if (!variant || !topic || !href) return null;
  const minutes = Math.max(1, Math.round(library.readingSeconds(variant) / 60));
  return (
    <Link
      to={href}
      className="pressable flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line hover:ring-primary"
    >
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: topicTint(topic.accentColor, 0.2) }}
      >
        <TopicIcon icon={topic.icon} size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block leading-snug font-semibold" lang={variant.locale}>
          {variant.title}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
          <span>{meta ?? topic.name[prefs.locale]}</span>
          <span aria-hidden="true">·</span>
          <span>{t('card.minutes', { count: minutes })}</span>
          {completed === true ? (
            <span className="flex items-center gap-0.5 font-semibold text-primary-strong">
              <CheckIcon size={14} strokeWidth={2.6} />
              {t('lesson.completed')}
            </span>
          ) : seen === true ? (
            <span>{t('lesson.seen')}</span>
          ) : null}
        </span>
      </span>
      {saved === true && (
        <span className="text-primary" aria-label={t('card.saved')}>
          <BookmarkIcon filled size={20} />
        </span>
      )}
    </Link>
  );
}
