import { isMastered, type QuizQuestion, type ReviewState } from '@lumen/domain';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ArrowRightIcon, CheckIcon, ChevronLeftIcon, ReviewIcon } from '../components/icons';
import { LessonArt } from '../components/LessonArt';
import { LessonRow } from '../components/LessonRow';
import { buttonPrimary, Card, EmptyState, Page, Section } from '../components/Page';
import { QuizRunner, type AnswerResult } from '../components/QuizRunner';
import { TopicIcon } from '../components/TopicIcon';
import { useApp, useDueReviews, useReviews } from '../data/app-context';
import { progress } from '../data/progress';

const BATCH = 5;

export default function Review() {
  const { t } = useTranslation();
  const { library, prefs, reportStorageError } = useApp();
  const due = useDueReviews();
  const reviews = useReviews();
  const [running, setRunning] = useState<{ questions: QuizQuestion[]; seed: number } | null>(null);
  const [lastResult, setLastResult] = useState<AnswerResult[] | null>(null);

  const known = useMemo(
    () => reviews.filter((r) => library.concept(r.conceptId) !== undefined),
    [reviews, library],
  );
  // One row per lesson (a lesson has a review state per question): mastered once every
  // question is, otherwise listed with its next due question.
  const byConcept = new Map<string, ReviewState[]>();
  for (const r of known) byConcept.set(r.conceptId, [...(byConcept.get(r.conceptId) ?? []), r]);
  const lessons = [...byConcept.values()].flatMap((states) => {
    const open = states
      .filter((r) => !isMastered(r))
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    const next = open[0] ?? states[0];
    return next ? [{ mastered: open.length === 0, next }] : [];
  });
  const mastered = lessons.filter((l) => l.mastered).map((l) => l.next);
  const learning = lessons
    .filter((l) => !l.mastered)
    .map((l) => l.next)
    .sort((a, b) => b.firstLearnedAt.localeCompare(a.firstLearnedAt));

  const startReview = () => {
    const questions = due
      .slice(0, BATCH)
      .map((r) => library.questionForGroup(r.questionGroupId, prefs.locale))
      .filter((q): q is QuizQuestion => q !== undefined);
    setLastResult(null);
    setRunning({ questions, seed: Math.floor(Math.random() * 2 ** 31) });
  };

  const onAnswer = (r: AnswerResult) => {
    progress
      .answer({
        mode: 'review',
        conceptId: r.question.conceptId,
        questionGroupId: r.question.questionGroupId,
        questionId: r.question.id,
        selectedOptionId: r.selectedOptionId,
        correct: r.correct,
        attempt: 1,
        locale: r.question.locale,
        timeZone: prefs.timezone,
        reviewOptIn: true,
      })
      .catch(reportStorageError);
  };

  if (running) {
    return (
      <ReviewSession
        questions={running.questions}
        seed={running.seed}
        onAnswer={onAnswer}
        onStop={() => {
          setRunning(null);
        }}
        onFinish={(results) => {
          setRunning(null);
          setLastResult(results);
        }}
      />
    );
  }

  return (
    <Page title={t('review.title')} subtitle={t('review.subtitle')}>
      {lastResult && (
        <div
          className="fade-up mb-5 flex items-center gap-3 rounded-[18px] bg-success-soft p-4"
          role="status"
        >
          <CheckIcon size={24} className="shrink-0 text-success" />
          <p className="font-semibold">
            {t('review.done', {
              correct: lastResult.filter((r) => r.correct).length,
              total: lastResult.length,
            })}
          </p>
        </div>
      )}

      <Section title={t('review.dueNow')}>
        {due.length === 0 ? (
          known.length === 0 ? (
            <EmptyState
              title={t('review.emptyTitle')}
              body={t('review.emptyBody')}
              action={
                <Link to="/app/discover" className={buttonPrimary}>
                  {t('review.goDiscover')}
                </Link>
              }
            />
          ) : (
            <Card className="flex flex-col items-center gap-1.5 p-5 text-center">
              <span className="mb-1 flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
                <ReviewIcon size={28} />
              </span>
              <p className="font-display text-[22px] font-bold tracking-tight">
                {t('review.caughtUpTitle')}
              </p>
              <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft">
                {t('review.caughtUpBody')}
              </p>
            </Card>
          )
        ) : (
          <Card className="p-5">
            <p className="font-display text-[64px] leading-none font-extrabold tracking-tighter tabular-nums">
              {due.length}
            </p>
            <p className="mt-1 text-[17px] font-semibold">
              {t('review.dueCount', { count: due.length })}
            </p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
              {t('review.lowPressure')}
            </p>
            <button
              type="button"
              onClick={startReview}
              className={`${buttonPrimary} mt-4 min-h-14`}
            >
              {t('review.start', { count: Math.min(BATCH, due.length) })}
              <ArrowRightIcon size={18} />
            </button>
          </Card>
        )}
      </Section>

      {learning.length > 0 && (
        <Section title={t('review.recentlyLearned')}>
          <ul className="flex flex-col gap-2.5">
            {learning.slice(0, 12).map((r) => (
              <ReviewRow key={`${r.conceptId}|${r.questionGroupId}`} state={r} />
            ))}
          </ul>
        </Section>
      )}

      {mastered.length > 0 && (
        <Section title={t('review.mastered')}>
          <ul className="flex flex-col gap-2.5">
            {mastered.map((r) => (
              <ReviewRow key={`${r.conceptId}|${r.questionGroupId}`} state={r} />
            ))}
          </ul>
        </Section>
      )}
      <p className="text-sm text-muted">{t('review.howItWorks')}</p>
    </Page>
  );
}

/**
 * A review run (Concept E, D15/P12): full screen, one question at a time. The topic, the
 * question and the lesson's review picture come first (never the answer), then the options;
 * the answer and why appear after a choice. Scheduling is the app's (§3.4).
 */
function ReviewSession({
  questions,
  seed,
  onAnswer,
  onStop,
  onFinish,
}: {
  questions: QuizQuestion[];
  seed: number;
  onAnswer: (r: AnswerResult) => void;
  onStop: () => void;
  onFinish: (results: AnswerResult[]) => void;
}) {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const current = questions[index];
  const topicId = current ? library.concept(current.conceptId)?.topicId : undefined;
  useEffect(() => {
    document.title = `${t('review.sessionTitle')} · ${t('app.name')}`;
    heading.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onStop();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [t, onStop]);
  return (
    <div className="review-stage" role="region" aria-labelledby="review-heading">
      <div className="review-head">
        <button type="button" className="deeper-ib" onClick={onStop} aria-label={t('review.stop')}>
          <ChevronLeftIcon size={24} />
        </button>
        <h1
          id="review-heading"
          ref={heading}
          tabIndex={-1}
          className="text-center text-[15px] font-semibold text-ink-soft tabular-nums outline-none"
        >
          <span className="sr-only">{t('review.sessionTitle')}: </span>
          {t('review.position', { current: index + 1, total: questions.length })}
        </h1>
        <span />
      </div>
      <div className="review-bar" aria-hidden="true">
        <i style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <div className="review-body" data-topic={topicId}>
        <QuizRunner
          variant="review"
          questions={questions}
          seed={seed}
          onAnswer={onAnswer}
          onIndexChange={setIndex}
          onFinish={onFinish}
          finishLabel={t('review.finish')}
          renderContext={(q) => {
            const concept = library.concept(q.conceptId);
            const topic = concept ? library.topic(concept.topicId) : undefined;
            return topic ? (
              <p className="review-chip" data-topic={topic.id} lang={prefs.locale}>
                <TopicIcon icon={topic.icon} size={18} className="text-tl" />
                {topic.name[prefs.locale]}
              </p>
            ) : null;
          }}
          renderMedia={(q) => {
            const concept = library.concept(q.conceptId);
            const variant = concept ? library.variant(concept.id, q.locale) : undefined;
            const topic = concept ? library.topic(concept.topicId) : undefined;
            if (!concept || !variant || !topic) return null;
            return (
              <div className="review-ill" data-topic={topic.id}>
                {concept.media?.review ? (
                  <LessonArt
                    concept={concept}
                    variant={variant}
                    slot="review"
                    accent={topic.accentColor}
                    priority
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <TopicIcon icon={topic.icon} size={72} className="text-tl" />
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

function ReviewRow({ state }: { state: ReviewState }) {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  const concept = library.concept(state.conceptId);
  const question = library.questionForGroup(state.questionGroupId, prefs.locale);
  if (!concept || !question) return null;
  const mastered = isMastered(state);
  return (
    <li>
      <LessonRow
        concept={concept}
        meta={
          mastered
            ? t('review.masteredNext', { date: new Date(state.dueAt) })
            : t('review.nextOn', { date: new Date(state.dueAt) })
        }
      />
    </li>
  );
}
