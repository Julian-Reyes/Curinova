import { isMastered, type QuizQuestion, type ReviewState } from '@lumen/domain';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { CheckIcon, ReviewIcon } from '../components/icons';
import {
  buttonPrimary,
  buttonSecondary,
  Card,
  EmptyState,
  Page,
  Section,
} from '../components/Page';
import { QuizRunner, type AnswerResult } from '../components/QuizRunner';
import { TopicIcon, topicTint } from '../components/TopicIcon';
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
  const mastered = known.filter((r) => isMastered(r));
  const learning = known
    .filter((r) => !isMastered(r))
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
      <Page title={t('review.sessionTitle')}>
        <Card className="p-5">
          <QuizRunner
            questions={running.questions}
            seed={running.seed}
            onAnswer={onAnswer}
            onFinish={(results) => {
              setRunning(null);
              setLastResult(results);
            }}
            finishLabel={t('review.finish')}
            renderContext={(q) => <ConceptLabel conceptId={q.conceptId} />}
          />
        </Card>
        <button
          type="button"
          onClick={() => {
            setRunning(null);
          }}
          className="pressable mt-4 min-h-11 px-2 font-semibold text-muted hover:text-ink"
        >
          {t('review.stop')}
        </button>
      </Page>
    );
  }

  return (
    <Page title={t('review.title')} subtitle={t('review.subtitle')}>
      {lastResult && (
        <div
          className="fade-up mb-6 flex items-center gap-3 rounded-[20px] bg-accent-soft p-4"
          role="status"
        >
          <CheckIcon size={24} className="shrink-0 text-primary-strong" />
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
          <EmptyState
            title={known.length === 0 ? t('review.emptyTitle') : t('review.caughtUpTitle')}
            body={known.length === 0 ? t('review.emptyBody') : t('review.caughtUpBody')}
            action={
              <Link to="/app/discover" className={buttonSecondary}>
                {t('review.goDiscover')}
              </Link>
            }
          />
        ) : (
          <Card className="glow-bg p-5">
            <p className="font-display text-2xl font-semibold">
              {t('review.dueCount', { count: due.length })}
            </p>
            <p className="mt-1 text-muted">{t('review.lowPressure')}</p>
            <button
              type="button"
              onClick={startReview}
              className={`${buttonPrimary} mt-4 w-full sm:w-auto`}
            >
              <ReviewIcon size={20} />
              {t('review.start', { count: Math.min(BATCH, due.length) })}
            </button>
          </Card>
        )}
      </Section>

      {learning.length > 0 && (
        <Section title={t('review.recentlyLearned')}>
          <ul className="flex flex-col gap-2">
            {learning.slice(0, 12).map((r) => (
              <ReviewRow key={`${r.conceptId}|${r.questionGroupId}`} state={r} />
            ))}
          </ul>
        </Section>
      )}

      {mastered.length > 0 && (
        <Section title={t('review.mastered')}>
          <ul className="flex flex-col gap-2">
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

function ConceptLabel({ conceptId }: { conceptId: string }) {
  const { library, prefs } = useApp();
  const v = library.variant(conceptId, prefs.locale);
  return v ? <p className="-mt-2 text-sm text-muted">{v.title}</p> : null;
}

function ReviewRow({ state }: { state: ReviewState }) {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  const concept = library.concept(state.conceptId);
  const question = library.questionForGroup(state.questionGroupId, prefs.locale);
  const topic = concept ? library.topic(concept.topicId) : undefined;
  if (!concept || !question || !topic) return null;
  const mastered = isMastered(state);
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: topicTint(topic.accentColor, 0.2) }}
      >
        <TopicIcon icon={topic.icon} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] leading-snug font-medium" lang={question.locale}>
          {question.prompt}
        </span>
        <span className="mt-0.5 block text-[13px] text-muted">
          {mastered
            ? t('review.masteredNext', { date: new Date(state.dueAt) })
            : t('review.nextOn', { date: new Date(state.dueAt) })}
        </span>
      </span>
    </li>
  );
}
