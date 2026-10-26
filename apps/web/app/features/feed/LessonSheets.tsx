import { isPublishedVariant, type Concept, type LessonVariant } from '@lumen/domain';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ArrowRightIcon, CheckIcon, SourcesIcon } from '../../components/icons';
import { QuizRunner, type AnswerResult } from '../../components/QuizRunner';
import { Sheet } from '../../components/Sheet';
import { TopicIcon, topicTint } from '../../components/TopicIcon';
import { useApp, useEvents } from '../../data/app-context';
import { progress } from '../../data/progress';

export function trailHref(
  library: ReturnType<typeof useApp>['library'],
  conceptId: string,
  locale: LessonVariant['locale'],
): string | undefined {
  const concept = library.concept(conceptId);
  const cluster = concept ? library.cluster(concept.clusterId) : undefined;
  if (!concept || !cluster) return undefined;
  return `/app/trail/${cluster.slug[locale]}?start=${encodeURIComponent(concept.id)}`;
}

export function QuizSheet({
  open,
  onOpenChange,
  variant,
  seed,
  onCompleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: LessonVariant;
  seed: number;
  onCompleted: (results: AnswerResult[]) => void;
}) {
  const { t } = useTranslation();
  const { library, prefs, reportStorageError } = useApp();
  const events = useEvents();
  const questions = library.questions(variant.conceptId, variant.locale);
  const [results, setResults] = useState<AnswerResult[] | null>(null);
  const [run, setRun] = useState(0);
  const attempts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) {
      if (e.type === 'quiz_answered' && e.response)
        map.set(e.response.questionId, (map.get(e.response.questionId) ?? 0) + 1);
    }
    return map;
    // Attempt numbers are fixed when the sheet opens, so answering doesn't renumber mid-quiz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, run]);

  const onAnswer = (r: AnswerResult) => {
    progress
      .answer({
        mode: 'quiz',
        conceptId: variant.conceptId,
        questionGroupId: r.question.questionGroupId,
        questionId: r.question.id,
        selectedOptionId: r.selectedOptionId,
        correct: r.correct,
        attempt: (attempts.get(r.question.id) ?? 0) + 1,
        locale: variant.locale,
        timeZone: prefs.timezone,
        reviewOptIn: prefs.reviewOptIn,
      })
      .catch(reportStorageError);
  };

  const correct = results?.filter((r) => r.correct).length ?? 0;
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setResults(null);
          setRun((n) => n + 1);
        }
      }}
      title={t('quiz.title')}
      description={variant.title}
      lang={variant.locale}
    >
      {questions.length === 0 ? (
        <p className="text-muted">{t('quiz.none')}</p>
      ) : results === null ? (
        <QuizRunner
          key={run}
          questions={questions}
          seed={seed}
          onAnswer={onAnswer}
          onFinish={(r) => {
            setResults(r);
            onCompleted(r);
          }}
          finishLabel={t('quiz.seeResult')}
        />
      ) : (
        <div
          className="fade-up flex flex-col items-center gap-3 py-4 text-center"
          lang={prefs.locale}
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-primary-strong">
            <CheckIcon size={32} />
          </div>
          <p className="font-display text-2xl font-semibold">
            {t('quiz.result', { correct, total: results.length })}
          </p>
          <p className="max-w-sm text-muted">
            {prefs.reviewOptIn ? t('quiz.reviewScheduled') : t('quiz.reviewOff')}
          </p>
          <button
            type="button"
            className="pressable mt-2 min-h-12 w-full rounded-2xl bg-primary px-5 font-semibold text-on-primary"
            onClick={() => {
              onOpenChange(false);
              setResults(null);
              setRun((n) => n + 1);
            }}
          >
            {t('common.done')}
          </button>
        </div>
      )}
    </Sheet>
  );
}

export function DeeperSheet({
  open,
  onOpenChange,
  variant,
  concept,
  nextConceptId,
  onContinueTrail,
  onOpenSources,
  withFullText = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: LessonVariant;
  concept: Concept;
  /** Start with the card's full text (opened from "Continue reading" on a long card). */
  withFullText?: boolean;
  nextConceptId: string | undefined;
  onContinueTrail: () => void;
  onOpenSources: () => void;
}) {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  const navigate = useNavigate();
  const next = nextConceptId ? library.variant(nextConceptId, prefs.locale) : undefined;
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={variant.title}
      description={t('deeper.title')}
      lang={variant.locale}
      footer={
        next ? (
          <button
            type="button"
            onClick={onContinueTrail}
            className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-semibold text-on-primary"
          >
            <span lang={prefs.locale}>{t('deeper.continueTrail')}</span>
            <ArrowRightIcon size={20} />
          </button>
        ) : undefined
      }
    >
      {withFullText && (
        <div className="mb-5 flex flex-col gap-3 border-b border-line pb-5 text-[16px] leading-relaxed">
          {variant.cardBlocks.map((b, i) =>
            b.type === 'takeaway' ? (
              <p
                key={i}
                className="rounded-2xl border-l-4 border-primary bg-accent-soft px-3.5 py-2.5 font-semibold"
              >
                {b.text}
              </p>
            ) : (
              <p key={i}>{b.text}</p>
            ),
          )}
        </div>
      )}
      <div className="flex flex-col gap-3 text-[16px] leading-relaxed">
        {variant.deepDiveBlocks.map((b, i) =>
          b.type === 'heading' ? (
            <h3 key={i} className="mt-2 font-display text-lg font-semibold">
              {b.text}
            </h3>
          ) : (
            <p key={i}>{b.text}</p>
          ),
        )}
      </div>

      {concept.related.length > 0 && (
        <section className="mt-6" lang={prefs.locale}>
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
            {t('deeper.related')}
          </h3>
          <ul className="flex flex-col gap-2">
            {concept.related.map((r) => {
              const target = library.variant(r.conceptId, prefs.locale);
              const targetConcept = library.concept(r.conceptId);
              const topic = targetConcept ? library.topic(targetConcept.topicId) : undefined;
              const href = trailHref(library, r.conceptId, prefs.locale);
              if (!target || !topic || !href) return null;
              return (
                <li key={r.conceptId}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      void navigate(href);
                    }}
                    className="pressable flex w-full items-start gap-3 rounded-2xl bg-sunken p-3 text-left ring-1 ring-line hover:ring-primary"
                  >
                    <span
                      className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: topicTint(topic.accentColor, 0.2) }}
                    >
                      <TopicIcon icon={topic.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug" lang={target.locale}>
                        {target.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {r.reason[prefs.locale] ?? r.reason.en ?? r.reason['pt-BR']}
                      </span>
                    </span>
                    <ArrowRightIcon size={18} className="mt-1 shrink-0 text-muted" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <button
        type="button"
        onClick={onOpenSources}
        className="pressable mt-5 flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-strong"
        lang={prefs.locale}
      >
        <SourcesIcon size={18} />
        {t('sources.open')}
      </button>
    </Sheet>
  );
}

export function SourcesSheet({
  open,
  onOpenChange,
  variant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: LessonVariant;
}) {
  const { t } = useTranslation();
  const { library } = useApp();
  const sources = library.sources(variant);
  const reviewed = isPublishedVariant(variant);
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('sources.title')}
      description={variant.title}
    >
      {!reviewed && (
        <div className="rounded-2xl bg-accent-soft p-4">
          <p className="font-semibold">{t('sources.draftTitle')}</p>
          <p className="mt-1 text-[15px] leading-relaxed">{t('sources.draftBody')}</p>
          {variant.generation !== null && (
            <p className="mt-2 text-sm text-muted">
              {t('sources.generatedWith', { model: variant.generation.model })}
            </p>
          )}
        </div>
      )}
      {sources.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {sources.map((s) => (
            <li key={s.id} className="rounded-2xl p-3 ring-1 ring-line">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-strong underline-offset-2 hover:underline"
              >
                {s.title}
              </a>
              <p className="text-sm text-muted">{s.publisher}</p>
            </li>
          ))}
        </ul>
      ) : (
        reviewed && <p className="mt-4 text-muted">{t('sources.none')}</p>
      )}
      {variant.reviewedAt !== null && (
        <p className="mt-4 text-sm text-muted">
          {t('sources.reviewedOn', { date: new Date(variant.reviewedAt) })}
        </p>
      )}
    </Sheet>
  );
}
