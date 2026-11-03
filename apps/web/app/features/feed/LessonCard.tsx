import { isPublishedVariant, type Concept, type LessonVariant } from '@lumen/domain';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRightIcon,
  BookmarkIcon,
  PauseIcon,
  QuizIcon,
  SpeakerIcon,
  StopIcon,
} from '../../components/icons';
import { LessonArt } from '../../components/LessonArt';
import { useToast } from '../../components/Toast';
import { TopicIcon } from '../../components/TopicIcon';
import { useApp, useProgress } from '../../data/app-context';
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
  seed: number;
  onNextInTrail: (nextConceptId: string) => void;
  onOpened?: (conceptId: string) => void;
  onQuizDone?: () => void;
  /** "Remember more" mode (P7): give the Quiz action visual emphasis. */
  emphasizeQuiz?: boolean;
}

/**
 * The Discover card (Concept E, D14): full-bleed lesson art under a dark scrim, the topic
 * and why this card is here, the title, a short card text (D15/P8), "Dive in", and a rail
 * with Save, Listen and Quiz. Tapping the card also opens Go Deeper (B18).
 */
export function LessonCard({
  concept,
  variant,
  active,
  saved,
  reason,
  seed,
  onNextInTrail,
  onOpened,
  onQuizDone,
  emphasizeQuiz = false,
}: LessonCardProps) {
  const { t } = useTranslation();
  const { library, prefs, reportStorageError } = useApp();
  const progress = useProgress();
  const toast = useToast();
  const [sheet, setSheet] = useState<'quiz' | 'deeper' | 'sources' | null>(null);
  const { markCompleted } = useLessonTracking(variant, active, onOpened);
  const openDeeper = () => {
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
  const draft = !isPublishedVariant(variant);
  const otherLanguage = variant.locale !== prefs.locale;
  const accent = topic?.accentColor ?? '#17151A';
  const paragraphs = variant.cardBlocks.filter((b) => b.type === 'paragraph');
  const takeaway = variant.cardBlocks.find((b) => b.type === 'takeaway');
  const topicName = topic?.name[prefs.locale];

  // Why this card is here (§6), worded around the topic name.
  const chip =
    reason === 'interest' && topicName
      ? t('card.reasonInterest', { topic: topicName })
      : reason === 'new'
        ? [topicName, t('card.reasonNew')].filter(Boolean).join(' · ')
        : reason === 'trail'
          ? [topicName, t('card.reasonTrail')].filter(Boolean).join(' · ')
          : topicName;

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

  return (
    // Tapping the card opens Go Deeper. Keyboard and screen-reader users have the "Dive in"
    // button for the same action, so this is a pointer shortcut only.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <article
      className="lesson-stage"
      data-topic={concept.topicId}
      data-active={active ? 'true' : undefined}
      aria-labelledby={`title-${variant.id}`}
      lang={variant.locale}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, a')) return;
        if (window.getSelection()?.toString()) return; // selecting text, not tapping
        openDeeper();
      }}
    >
      <LessonArt
        concept={concept}
        variant={variant}
        slot="discover"
        accent={accent}
        priority={active}
        className="stage-art"
        plateClassName="stage-plate"
      />
      <div className="stage-shade" aria-hidden="true" />

      <div className="stage-copy">
        {draft && (
          <div lang={prefs.locale}>
            <button
              type="button"
              onClick={() => {
                setSheet('sources');
              }}
              aria-label={t('card.draftBadgeLabel')}
              className="stage-draft pressable"
            >
              {t('card.draftBadge')}
            </button>
          </div>
        )}
        <p className="stage-chip" lang={prefs.locale}>
          <span className="stage-tico">{topic && <TopicIcon icon={topic.icon} size={13} />}</span>
          <span className="min-w-0">
            {chip}
            {cluster && step > 0 && (
              <span
                className="stage-step"
                aria-label={t('card.trailStep', {
                  trail: cluster.title[prefs.locale],
                  step,
                  total: trailIds.length,
                })}
              >
                {' · '}
                {t('card.trailStepShort', { step, total: trailIds.length })}
              </span>
            )}
            {otherLanguage && (
              <span className="stage-step">
                {' · '}
                {t('card.otherLanguage', { language: t(`language.${variant.locale}`) })}
              </span>
            )}
          </span>
        </p>
        <h2 id={`title-${variant.id}`} className="stage-title">
          {variant.title}
        </h2>
        <p className="stage-text">{variant.cardText ?? variant.summary}</p>
        <div>
          <button
            type="button"
            onClick={openDeeper}
            className="stage-dive"
            lang={prefs.locale}
            aria-label={t('card.diveInLabel', { title: variant.title })}
          >
            {t('card.diveIn')}
            <ArrowUpRightIcon size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="stage-rail" lang={prefs.locale}>
        <RailButton
          label={saved ? t('card.saved') : t('card.save')}
          icon={<BookmarkIcon filled={saved} size={23} />}
          onClick={toggleSave}
          pressed={saved}
        />
        <RailButton
          label={
            speech.state === 'speaking'
              ? t('card.pause')
              : speech.state === 'paused'
                ? t('card.resume')
                : t('card.listen')
          }
          icon={speech.state === 'speaking' ? <PauseIcon size={23} /> : <SpeakerIcon size={23} />}
          onClick={listen}
          pressed={speech.state !== 'idle'}
          muted={speech.availability !== 'ready'}
        />
        <RailButton
          label={t('card.quiz')}
          icon={<QuizIcon size={23} />}
          emphasis={emphasizeQuiz}
          onClick={() => {
            setSheet('quiz');
          }}
        />
      </div>

      {speech.state !== 'idle' && (
        <div className="stage-audio fade-up" lang={prefs.locale}>
          <button
            type="button"
            onClick={speech.stop}
            className="pressable flex size-9 items-center justify-center rounded-full bg-white/15"
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
        variant={variant}
        concept={concept}
        saved={saved}
        onToggleSave={toggleSave}
        onListen={listen}
        listening={speech.state === 'speaking'}
        onRead={markCompleted}
        nextConceptId={nextId}
        onContinueTrail={() => {
          setSheet(null);
          if (nextId) onNextInTrail(nextId);
        }}
        onQuiz={() => {
          setSheet('quiz');
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

function RailButton({
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
      className={`stage-act ${muted === true ? 'is-muted' : ''} ${emphasis === true ? 'is-emphasis' : ''}`}
    >
      <span className="stage-disc">
        <span className={`action-icon ${pressed === true ? 'is-on' : ''}`}>{icon}</span>
      </span>
      <span>{label}</span>
    </button>
  );
}
