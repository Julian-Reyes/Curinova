import { isPublishedVariant, type Concept, type LessonVariant } from '@lumen/domain';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
  ArrowRightIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  QuizIcon,
  SpeakerIcon,
} from '../../components/icons';
import { imageCredits, LessonArt } from '../../components/LessonArt';
import { QuizRunner, type AnswerResult } from '../../components/QuizRunner';
import { Sheet } from '../../components/Sheet';
import { useApp, useEvents } from '../../data/app-context';
import { progress } from '../../data/progress';

/** Opens a lesson in its trail; `from` is where the trail's exit returns (an /app/ path). */
export function trailHref(
  library: ReturnType<typeof useApp>['library'],
  conceptId: string,
  locale: LessonVariant['locale'],
  from?: string,
): string | undefined {
  const concept = library.concept(conceptId);
  const cluster = concept ? library.cluster(concept.clusterId) : undefined;
  if (!concept || !cluster) return undefined;
  const back = from === undefined ? '' : `&from=${encodeURIComponent(from)}`;
  return `/app/trail/${cluster.slug[locale]}?start=${encodeURIComponent(concept.id)}${back}`;
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

/** Go Deeper counts the lesson as read after 40% of its reading time (D15). */
export const DEEPER_READ_SHARE = 0.4;

/**
 * Go Deeper (Concept E): a full-height sheet with the lesson image, the big picture, key
 * takeaways, how it works, the deep dive, sources, related lessons and the next step in
 * the trail. Drag the header down or press Escape to close.
 */
export function DeeperSheet({
  open,
  onOpenChange,
  variant,
  concept,
  saved,
  onToggleSave,
  onListen,
  listening,
  onRead,
  nextConceptId,
  onContinueTrail,
  onQuiz,
  onOpenSources,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: LessonVariant;
  concept: Concept;
  saved: boolean;
  onToggleSave: () => void;
  onListen: () => void;
  listening: boolean;
  /** Called once the sheet has been open long enough to count as read. */
  onRead: () => void;
  nextConceptId: string | undefined;
  onContinueTrail: () => void;
  onQuiz: () => void;
  onOpenSources: () => void;
}) {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  const navigate = useNavigate();
  const panel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [diagramOpen, setDiagramOpen] = useState(false);
  const topic = library.topic(concept.topicId);
  const cluster = library.cluster(concept.clusterId);
  const accent = topic?.accentColor ?? '#17151A';
  const next = nextConceptId ? library.variant(nextConceptId, prefs.locale) : undefined;
  const nextConcept = nextConceptId ? library.concept(nextConceptId) : undefined;
  const step = cluster ? cluster.conceptIds.indexOf(concept.id) + 1 : 0;
  const paragraphs = variant.cardBlocks.filter((b) => b.type === 'paragraph').map((b) => b.text);
  const [first, ...rest] = paragraphs;
  const takeaway = variant.cardBlocks.find((b) => b.type === 'takeaway');
  // The takeaway, or the summary for lessons without one (they say much the same thing).
  const takeaways = [takeaway?.text ?? variant.summary];
  const draft = !isPublishedVariant(variant);
  const sources = library.sources(variant);
  const credits = imageCredits(concept);
  const hasImage = concept.media?.deeper !== undefined;

  // Deep-dive paragraphs grouped under their headings, each group a collapsible section.
  const groups: { title: string; paragraphs: string[] }[] = [];
  for (const b of variant.deepDiveBlocks) {
    if (b.type === 'heading') groups.push({ title: b.text, paragraphs: [] });
    else if (groups.length === 0)
      groups.push({ title: t('deeper.goFurther'), paragraphs: [b.text] });
    else groups.at(-1)?.paragraphs.push(b.text);
  }

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(
      onRead,
      Math.max(1000, library.readingSeconds(variant) * 1000 * DEEPER_READ_SHARE),
    );
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per opening
  }, [open, variant.id]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { startY: e.clientY, dy: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !panel.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.startY);
    panel.current.style.transform = `translateY(${drag.current.dy}px)`;
    panel.current.style.transition = 'none';
  };
  const onPointerUp = () => {
    if (!drag.current || !panel.current) return;
    const { dy } = drag.current;
    drag.current = null;
    panel.current.style.transition = '';
    panel.current.style.transform = '';
    if (dy > 90) onOpenChange(false);
  };

  const lessonRow = (conceptId: string, sub: string, onOpen: () => void): React.ReactNode => {
    const c = library.concept(conceptId);
    const v = library.variant(conceptId, prefs.locale);
    if (!c || !v) return null;
    const tp = library.topic(c.topicId);
    return (
      <button
        type="button"
        onClick={onOpen}
        className="deeper-row pressable"
        data-topic={c.topicId}
      >
        <span className="deeper-thumb">
          <LessonArt
            concept={c}
            variant={v}
            slot="thumb"
            accent={tp?.accentColor ?? accent}
            className="h-full w-full object-cover"
            plateClassName="deeper-thumb-plate"
          />
        </span>
        <span className="min-w-0">
          <span className="block text-[14.5px] leading-snug font-semibold" lang={v.locale}>
            {v.title}
          </span>
          <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{sub}</span>
        </span>
        <ChevronRightIcon size={20} className="text-muted" />
      </button>
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay fixed inset-0 z-50 bg-[var(--scrim)]" />
        <Dialog.Content
          ref={panel}
          className="deeper-panel sheet-panel"
          data-topic={concept.topicId}
          data-scrolled={scrolled ? 'true' : undefined}
          lang={variant.locale}
        >
          <div
            className="deeper-head"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span className="deeper-grab" aria-hidden="true" />
            <div className="flex items-center gap-0.5" lang={prefs.locale}>
              <Dialog.Close className="deeper-ib" aria-label={t('common.back')}>
                <ChevronLeftIcon size={24} />
              </Dialog.Close>
              <Dialog.Title
                className="min-w-0 flex-1 truncate px-1 text-[14px] font-semibold"
                lang={variant.locale}
              >
                {variant.title}
              </Dialog.Title>
              <Dialog.Description className="sr-only">{t('deeper.title')}</Dialog.Description>
              <button
                type="button"
                className="deeper-ib"
                onClick={onListen}
                aria-pressed={listening}
                aria-label={t('card.listen')}
              >
                <SpeakerIcon size={22} />
              </button>
              <button
                type="button"
                className="deeper-ib"
                onClick={onToggleSave}
                aria-pressed={saved}
                aria-label={saved ? t('card.saved') : t('card.save')}
              >
                <BookmarkIcon filled={saved} size={22} />
              </button>
            </div>
          </div>

          <div
            className="deeper-scroll"
            onScroll={(e) => {
              setScrolled(e.currentTarget.scrollTop > 8);
            }}
          >
            <figure className="deeper-hero">
              <LessonArt
                concept={concept}
                variant={variant}
                slot="deeper"
                accent={accent}
                priority
                className="h-full w-full object-cover"
                plateClassName="deeper-hero-plate"
              />
            </figure>

            <section className="deeper-sec">
              <h3 className="deeper-label" lang={prefs.locale}>
                {t('deeper.bigPicture')}
              </h3>
              <p className="deeper-p deeper-lead">{first ?? variant.summary}</p>
            </section>

            <section className="deeper-sec deeper-take">
              <h3 className="mb-1.5 text-[15px] font-bold" lang={prefs.locale}>
                {t('deeper.keyTakeaways')}
              </h3>
              <ul>
                {takeaways.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </section>

            {(hasImage || rest.length > 0 || groups.length > 0) && (
              <section className="deeper-sec">
                <h3 className="deeper-label" lang={prefs.locale}>
                  {t('deeper.howItWorks')}
                </h3>
                {hasImage && (
                  <div className="deeper-diagram" data-open={diagramOpen ? 'true' : undefined}>
                    <div className="deeper-diagram-box">
                      <LessonArt
                        concept={{ ...concept, media: undefined }}
                        variant={variant}
                        slot="deeper"
                        accent={accent}
                        plateClassName="deeper-diagram-plate"
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="flex-1 text-[13px] leading-snug text-muted">
                        {variant.heroMedia.alt}
                      </p>
                      <button
                        type="button"
                        className="deeper-chipbtn pressable"
                        aria-expanded={diagramOpen}
                        onClick={() => {
                          setDiagramOpen((o) => !o);
                        }}
                        lang={prefs.locale}
                      >
                        {diagramOpen ? t('deeper.showLess') : t('deeper.showMore')}
                      </button>
                    </div>
                  </div>
                )}
                {rest.map((text) => (
                  <p key={text} className="deeper-p mt-3.5">
                    {text}
                  </p>
                ))}
                {groups.map((g) => (
                  <details key={g.title} className="deeper-more">
                    <summary>
                      {g.title}
                      <ChevronDownIcon size={20} />
                    </summary>
                    <div className="px-3.5 pb-1.5">
                      {g.paragraphs.map((text) => (
                        <p key={text} className="deeper-p">
                          {text}
                        </p>
                      ))}
                    </div>
                  </details>
                ))}
              </section>
            )}

            <section className="deeper-sec" lang={prefs.locale}>
              <h3 className="deeper-label">{t('deeper.sources')}</h3>
              <div className="deeper-card p-4">
                {draft && (
                  <>
                    <button
                      type="button"
                      className="deeper-draft pressable"
                      onClick={onOpenSources}
                    >
                      {t('deeper.draft')}
                    </button>
                    <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
                      {t('sources.draftBody')}
                    </p>
                  </>
                )}
                {sources.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-2">
                    {sources.map((src) => (
                      <li key={src.id} className="text-[14px]">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-tl underline-offset-2 hover:underline"
                        >
                          {src.title}
                        </a>
                        <span className="text-muted"> · {src.publisher}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {credits.length > 0 && (
                  <p className="mt-3 border-t border-line pt-3 text-[13px] text-muted">
                    {t('deeper.photoCredit', { credit: credits.join(' · ') })}
                  </p>
                )}
              </div>
            </section>

            {concept.related.length > 0 && (
              <section className="deeper-sec" lang={prefs.locale}>
                <h3 className="deeper-label">{t('deeper.relatedLabel')}</h3>
                <ul className="grid gap-2.5">
                  {concept.related.map((r) => {
                    const href = trailHref(library, r.conceptId, prefs.locale);
                    if (!href) return null;
                    return (
                      <li key={r.conceptId}>
                        {lessonRow(
                          r.conceptId,
                          r.reason[prefs.locale] ?? r.reason.en ?? r.reason['pt-BR'] ?? '',
                          () => {
                            onOpenChange(false);
                            void navigate(href);
                          },
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {cluster && (
              <section className="deeper-sec" lang={prefs.locale}>
                <h3 className="deeper-label">{t('deeper.nextInTrail')}</h3>
                {next && nextConcept ? (
                  lessonRow(
                    nextConcept.id,
                    `${cluster.title[prefs.locale]} · ${t('card.trailStepShort', { step: step + 1, total: cluster.conceptIds.length })}`,
                    onContinueTrail,
                  )
                ) : (
                  <p className="deeper-p">{t('deeper.endOfTrail')}</p>
                )}
              </section>
            )}
          </div>

          <div className="deeper-foot" lang={prefs.locale}>
            <button type="button" className="deeper-pill pressable" onClick={onQuiz}>
              <QuizIcon size={20} />
              {t('card.quiz')}
            </button>
            {next ? (
              <button
                type="button"
                className="deeper-pill is-solid pressable"
                onClick={onContinueTrail}
              >
                {t('deeper.continueTrail')}
                <ArrowRightIcon size={20} />
              </button>
            ) : (
              <Dialog.Close className="deeper-pill is-solid pressable">
                {t('deeper.backToDiscover')}
              </Dialog.Close>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
