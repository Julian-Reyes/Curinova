import { isPublishedVariant, type Concept, type LessonVariant } from '@lumen/domain';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookmarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  DeeperIcon,
  PauseIcon,
  QuizIcon,
  SpeakerIcon,
  StopIcon,
} from '../../components/icons';
import { Illustration } from '../../components/Illustration';
import { useToast } from '../../components/Toast';
import { TopicIcon, topicTint } from '../../components/TopicIcon';
import { useApp } from '../../data/app-context';
import { progress } from '../../data/progress';
import { useSpeech } from '../../hooks/useSpeech';
import { DeeperSheet, QuizSheet, SourcesSheet } from './LessonSheets';
import { useLessonTracking } from './tracking';

export type CardReason = 'interest' | 'trail' | 'new';

export interface LessonCardProps {
  concept: Concept;
  variant: LessonVariant;
  active: boolean;
  saved: boolean;
  reason?: CardReason | undefined;
  /** Position in the session ("3 of 5"); total null for unlimited sessions. */
  sessionProgress?: { current: number; total: number | null } | undefined;
  seed: number;
  onNextInTrail: (nextConceptId: string) => void;
  onOpened?: (conceptId: string) => void;
  onQuizDone?: () => void;
  /** "Remember more" mode (P7): give the Quiz action visual emphasis. */
  emphasizeQuiz?: boolean;
}

export function LessonCard({
  concept,
  variant,
  active,
  saved,
  reason,
  sessionProgress,
  seed,
  onNextInTrail,
  onOpened,
  onQuizDone,
  emphasizeQuiz = false,
}: LessonCardProps) {
  const { t } = useTranslation();
  const { library, prefs, reportStorageError } = useApp();
  const toast = useToast();
  const [sheet, setSheet] = useState<'quiz' | 'deeper' | 'sources' | null>(null);
  const { markCompleted } = useLessonTracking(variant, active, onOpened);
  // Cards never scroll (P6 decision): when the paragraphs don't fit, they end in a
  // fade with "Continue reading", which opens Go deeper starting with the full text.
  const textRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const updateOverflow = useCallback(() => {
    const el = textRef.current;
    if (el) setOverflow(el.scrollHeight - el.clientHeight > 1);
  }, []);
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [updateOverflow]);
  const [deeperWithText, setDeeperWithText] = useState(false);
  const openDeeper = (withFullText: boolean) => {
    setDeeperWithText(withFullText);
    setSheet('deeper');
    progress.record('deep_dive_opened', concept.id, variant.locale).catch(reportStorageError);
  };
  const speech = useSpeech(
    variant.locale,
    prefs.audioSpeed,
    `${variant.id}:${String(active)}`,
    prefs.voiceURI,
  );

  const topic = library.topic(concept.topicId);
  const cluster = library.cluster(concept.clusterId);
  const trailIds = cluster?.conceptIds ?? [];
  const step = trailIds.indexOf(concept.id) + 1;
  const nextId = trailIds[step];
  const next = nextId ? library.variant(nextId, prefs.locale) : undefined;
  const minutes = Math.max(1, Math.round(library.readingSeconds(variant) / 60));
  const draft = !isPublishedVariant(variant);
  const otherLanguage = variant.locale !== prefs.locale;
  const accent = topic?.accentColor ?? '#087F75';
  const paragraphs = variant.cardBlocks.filter((b) => b.type === 'paragraph');
  const takeaway = variant.cardBlocks.find((b) => b.type === 'takeaway');

  const toggleSave = () => {
    const nextSaved = !saved;
    progress
      .setBookmark(concept.id, nextSaved, variant.locale)
      .then(() => {
        toast(nextSaved ? t('card.savedToast') : t('card.unsavedToast'));
      })
      .catch(reportStorageError);
  };

  const listen = () => {
    if (speech.availability === 'unsupported') {
      toast(t('audio.unsupported'));
      return;
    }
    if (speech.availability === 'no-voice') {
      toast(t('audio.noVoice', { language: t(`language.${variant.locale}`) }));
      return;
    }
    if (speech.state === 'speaking') speech.pause();
    else if (speech.state === 'paused') speech.resume();
    else
      speech.play(
        [variant.title, ...paragraphs.map((b) => b.text), takeaway?.text ?? ''].join('. '),
      );
  };

  const reasonLabel =
    reason === 'trail'
      ? t('card.reasonTrail')
      : reason === 'interest' && topic
        ? t('card.reasonInterest', { topic: topic.name[prefs.locale] })
        : reason === 'new'
          ? t('card.reasonNew')
          : undefined;

  return (
    <article
      className="lesson-card relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-card ring-1 ring-line"
      aria-labelledby={`title-${variant.id}`}
      lang={variant.locale}
    >
      {/* Hero: topic tint glow + original illustration, with the meta row overlaid. */}
      <div
        className="card-hero relative"
        style={{
          background: `radial-gradient(120% 120% at 85% 0%, ${topicTint(accent, 0.22)} 0%, transparent 60%), linear-gradient(160deg, var(--glow-1), var(--glow-2))`,
        }}
      >
        <div
          className="card-hero-row absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 px-3.5 pt-3"
          lang={prefs.locale}
        >
          {topic && (
            <span className="flex min-w-0 items-center gap-1.5 rounded-full bg-surface/85 py-1 pr-2.5 pl-1.5 text-[11.5px] font-semibold tracking-wide uppercase shadow-sm backdrop-blur">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: topicTint(accent, 0.25) }}
              >
                <TopicIcon icon={topic.icon} size={14} />
              </span>
              <span className="truncate">{topic.name[prefs.locale]}</span>
            </span>
          )}
          <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-surface/85 px-2 py-1 text-[11.5px] font-semibold shadow-sm backdrop-blur">
            <ClockIcon size={13} />
            {t('card.minutes', { count: minutes })}
          </span>
          {sessionProgress && (
            <span
              className="shrink-0 rounded-full bg-ink px-2 py-1 text-[11.5px] font-bold text-bg"
              aria-label={
                sessionProgress.total === null
                  ? t('card.sessionCountUnlimited', { count: sessionProgress.current })
                  : t('card.sessionCount', {
                      current: sessionProgress.current,
                      total: sessionProgress.total,
                    })
              }
            >
              {sessionProgress.total === null
                ? sessionProgress.current
                : `${sessionProgress.current}/${sessionProgress.total}`}
            </span>
          )}
        </div>
        <Illustration
          id={
            variant.heroMedia.type === 'illustration' ? variant.heroMedia.illustrationId : 'fixture'
          }
          accent={accent}
          className="card-illustration mx-auto w-full"
        />
        <span className="sr-only">{variant.heroMedia.alt}</span>
      </div>

      {/* Tapping the card opens Go deeper. Keyboard and screen-reader users have the
          "Go deeper" button for the same action, so this is a pointer shortcut only. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="card-body flex min-h-0 cursor-pointer flex-col px-5 pt-2.5"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button, a')) return;
          if (window.getSelection()?.toString()) return; // selecting text, not tapping
          openDeeper(overflow);
        }}
      >
        <p className="card-meta truncate text-[12.5px] font-medium text-muted" lang={prefs.locale}>
          {draft && (
            <button
              type="button"
              onClick={() => {
                setSheet('sources');
              }}
              aria-label={t('card.draftBadgeLabel')}
              className="pressable mr-1.5 inline-flex rounded-full bg-sunken px-2 py-0.5 align-[1px] text-[11px] font-semibold text-muted ring-1 ring-line hover:text-ink"
            >
              {t('card.draftBadge')}
            </button>
          )}
          {reason !== 'trail' && reasonLabel && (
            <span className="font-semibold text-primary-strong">{reasonLabel}</span>
          )}
          {reason !== 'trail' && reasonLabel && cluster && step > 0 && (
            <span aria-hidden="true"> · </span>
          )}
          {cluster && step > 0 && (
            <span className={reason === 'trail' ? 'font-semibold text-primary-strong' : ''}>
              {reason === 'trail'
                ? t('card.trailStep', {
                    trail: cluster.title[prefs.locale],
                    step,
                    total: trailIds.length,
                  })
                : t('card.trailShort', { step, total: trailIds.length })}
            </span>
          )}
          {otherLanguage && (
            <span>
              {' · '}
              {t('card.otherLanguage', { language: t(`language.${variant.locale}`) })}
            </span>
          )}
        </p>
        <h2
          id={`title-${variant.id}`}
          className="card-title mt-1 font-display font-semibold text-balance text-ink"
        >
          {variant.title}
        </h2>
        <div className="card-text mt-1.5 flex min-h-0 flex-1 flex-col text-ink/90">
          <div
            ref={textRef}
            data-overflow={overflow ? 'more' : undefined}
            className="card-paragraphs flex min-h-0 flex-1 flex-col gap-2 overflow-hidden"
          >
            {paragraphs.map((b, i) => (
              <p key={i}>{b.text}</p>
            ))}
          </div>
          {overflow && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDeeper(true);
              }}
              className="card-continue pressable -mt-1 flex min-h-9 shrink-0 items-center gap-1 self-start rounded-full text-[14px] font-semibold text-primary-strong"
              lang={prefs.locale}
            >
              {t('card.continueReading')}
              <ChevronDownIcon size={16} />
            </button>
          )}
          {takeaway && (
            <p className="card-takeaway mt-2 shrink-0 rounded-2xl border-l-4 border-primary bg-accent-soft px-3.5 py-2 font-semibold text-ink">
              {takeaway.text}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="relative mt-auto shrink-0 px-2 pt-1.5 pb-2" lang={prefs.locale}>
        {speech.state !== 'idle' && (
          <div className="fade-up absolute inset-x-3 -top-12 flex items-center gap-2 rounded-full bg-ink px-2 py-1.5 text-bg shadow-card">
            <button
              type="button"
              onClick={speech.stop}
              className="pressable flex size-9 items-center justify-center rounded-full bg-bg/15"
              aria-label={t('audio.stop')}
            >
              <StopIcon size={18} />
            </button>
            <span className="flex-1 truncate text-sm font-medium">
              {speech.state === 'paused' ? t('audio.paused') : t('audio.playing')}
            </span>
            <span className="pr-2 text-xs opacity-80">
              {t('audio.speedValue', { speed: prefs.audioSpeed })}
            </span>
          </div>
        )}
        <div className="grid grid-cols-4 gap-1">
          <ActionButton
            label={
              speech.state === 'speaking'
                ? t('card.pause')
                : speech.state === 'paused'
                  ? t('card.resume')
                  : t('card.listen')
            }
            icon={speech.state === 'speaking' ? <PauseIcon /> : <SpeakerIcon />}
            onClick={listen}
            pressed={speech.state !== 'idle'}
            muted={speech.availability !== 'ready'}
          />
          <ActionButton
            label={saved ? t('card.saved') : t('card.save')}
            icon={<BookmarkIcon filled={saved} />}
            onClick={toggleSave}
            pressed={saved}
          />
          <ActionButton
            label={t('card.quiz')}
            icon={<QuizIcon />}
            emphasis={emphasizeQuiz}
            onClick={() => {
              setSheet('quiz');
            }}
          />
          <ActionButton
            label={t('card.deeper')}
            icon={<DeeperIcon />}
            onClick={() => {
              openDeeper(overflow);
            }}
          />
        </div>
        {next && nextId && (
          <button
            type="button"
            onClick={() => {
              onNextInTrail(nextId);
            }}
            className="card-next pressable mx-2 mt-1 flex min-h-11 w-[calc(100%-1rem)] items-center gap-2 rounded-2xl px-3 text-left text-[13.5px] hover:bg-sunken"
          >
            <span className="shrink-0 font-semibold text-primary-strong">
              {t('card.nextInTrail')}
            </span>
            <span className="min-w-0 flex-1 truncate text-muted" lang={next.locale}>
              {next.title}
            </span>
            <ChevronRightIcon size={18} className="shrink-0 text-muted" />
          </button>
        )}
      </div>

      <QuizSheet
        open={sheet === 'quiz'}
        onOpenChange={(o) => {
          setSheet(o ? 'quiz' : null);
        }}
        variant={variant}
        seed={seed}
        onCompleted={() => {
          markCompleted();
          onQuizDone?.();
        }}
      />
      <DeeperSheet
        open={sheet === 'deeper'}
        onOpenChange={(o) => {
          setSheet(o ? 'deeper' : null);
        }}
        withFullText={deeperWithText}
        variant={variant}
        concept={concept}
        nextConceptId={nextId}
        onContinueTrail={() => {
          setSheet(null);
          if (nextId) onNextInTrail(nextId);
        }}
        onOpenSources={() => {
          setSheet('sources');
        }}
      />
      <SourcesSheet
        open={sheet === 'sources'}
        onOpenChange={(o) => {
          setSheet(o ? 'sources' : null);
        }}
        variant={variant}
      />
    </article>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  pressed,
  muted,
  emphasis,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  pressed?: boolean;
  muted?: boolean;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`pressable flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[12px] leading-tight font-semibold hover:bg-sunken ${
        pressed ? 'text-primary-strong' : muted ? 'text-muted' : 'text-ink'
      } ${emphasis === true ? 'bg-accent-soft text-primary-strong' : ''}`}
    >
      <span className={`action-icon ${pressed ? 'is-on' : ''}`}>{icon}</span>
      <span className="text-center">{label}</span>
    </button>
  );
}
