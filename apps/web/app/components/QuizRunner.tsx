import { hashString, seededShuffle, type QuizQuestion } from '@lumen/domain';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckIcon, CloseIcon } from './icons';

type OptionState = 'idle' | 'correct' | 'wrong' | 'dim';

function optionState(answered: boolean, isCorrect: boolean, isSelected: boolean): OptionState {
  if (!answered) return 'idle';
  if (isCorrect) return 'correct';
  return isSelected ? 'wrong' : 'dim';
}

export interface AnswerResult {
  question: QuizQuestion;
  selectedOptionId: string;
  correct: boolean;
}

/**
 * One question at a time; tapping an option submits it (§3.3 "one-tap quizzes").
 * Options are shuffled per question and session, answers stay hidden until a choice
 * is made, and feedback is announced to screen readers.
 */
export function QuizRunner({
  questions,
  seed,
  onAnswer,
  onFinish,
  finishLabel,
  renderContext,
  renderMedia,
  variant = 'sheet',
  onIndexChange,
}: {
  questions: readonly QuizQuestion[];
  seed: number;
  onAnswer: (result: AnswerResult) => void;
  onFinish: (results: AnswerResult[]) => void;
  finishLabel: string;
  /** Optional line above each question (e.g. the lesson title in Review). */
  renderContext?: (question: QuizQuestion) => React.ReactNode;
  /** Optional picture between the question and its options (Review). */
  renderMedia?: (question: QuizQuestion) => React.ReactNode;
  /** "review": the full-screen Review layout, whose header shows the position. */
  variant?: 'sheet' | 'review';
  onIndexChange?: (index: number) => void;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const question = questions[index];
  const options = useMemo(
    () => (question ? seededShuffle(question.options, hashString(question.id) ^ seed) : []),
    [question, seed],
  );
  if (!question) return null;

  const answered = selected !== null;
  const correct = selected === question.correctOptionId;
  const last = index === questions.length - 1;
  const correctText = question.options.find((o) => o.id === question.correctOptionId)?.text ?? '';

  const choose = (optionId: string) => {
    if (answered) return;
    const result = {
      question,
      selectedOptionId: optionId,
      correct: optionId === question.correctOptionId,
    };
    setSelected(optionId);
    setResults((r) => [...r, result]);
    onAnswer(result);
    requestAnimationFrame(() => nextButton.current?.focus());
  };

  const next = () => {
    if (last) {
      onFinish(results);
      return;
    }
    setIndex((i) => i + 1);
    onIndexChange?.(index + 1);
    setSelected(null);
  };
  const review = variant === 'review';

  return (
    <div
      className="flex flex-col gap-4"
      lang={question.locale}
      key={review ? question.id : undefined}
    >
      {!review && (
        <div className="flex items-center gap-2" aria-hidden="true">
          {questions.map((q, i) => (
            <span
              key={q.id}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-[var(--dur)] ${
                i < index || (i === index && answered)
                  ? results[i]?.correct
                    ? 'bg-primary'
                    : 'bg-danger'
                  : i === index
                    ? 'bg-line-strong'
                    : 'bg-line'
              }`}
            />
          ))}
        </div>
      )}
      <p
        className={review ? 'sr-only' : 'text-xs font-semibold tracking-wide text-muted uppercase'}
      >
        {t('quiz.progress', { current: index + 1, total: questions.length })}
      </p>
      {renderContext?.(question)}
      <h3
        className={
          review
            ? 'review-question'
            : 'font-display text-[20px] leading-snug font-bold tracking-tight text-balance'
        }
        id={`q-${question.id}`}
      >
        {question.prompt}
      </h3>
      {renderMedia?.(question)}
      <ul className="flex flex-col gap-2.5" aria-labelledby={`q-${question.id}`}>
        {options.map((option) => {
          const isSelected = option.id === selected;
          const isCorrect = option.id === question.correctOptionId;
          const state = optionState(answered, isCorrect, isSelected);
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => {
                  choose(option.id);
                }}
                disabled={answered}
                aria-pressed={isSelected}
                className={`pressable quiz-option flex min-h-[54px] w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left text-[15px] leading-snug font-medium ${
                  state === 'idle'
                    ? 'border-line-strong bg-surface hover:border-ink/40'
                    : state === 'correct'
                      ? 'quiz-pop border-success bg-success-soft text-ink'
                      : state === 'wrong'
                        ? 'quiz-shake border-danger bg-danger-soft text-ink'
                        : 'border-line bg-surface text-muted'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-5 shrink-0 rounded-full border-[1.5px] ${
                    state === 'correct'
                      ? 'border-success bg-success'
                      : state === 'wrong'
                        ? 'border-danger bg-danger'
                        : 'border-line-strong'
                  }`}
                />
                <span className="flex-1">{option.text}</span>
                {state === 'correct' && <CheckIcon size={22} className="shrink-0 text-success" />}
                {state === 'wrong' && <CloseIcon size={22} className="shrink-0 text-danger" />}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="assertive" className="contents">
        {answered && (
          <div
            className={`fade-up rounded-[18px] p-4 ${review ? 'bg-tbg' : correct ? 'bg-success-soft' : 'bg-danger-soft'}`}
          >
            <p className={`font-semibold ${correct ? 'text-success' : 'text-danger'}`}>
              {correct ? t('quiz.correct') : t('quiz.incorrect', { answer: correctText })}
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed">{question.explanation}</p>
            {!correct && question.misconception !== undefined && (
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                <span className="font-semibold text-ink">{t('quiz.misconception')} </span>
                {question.misconception}
              </p>
            )}
          </div>
        )}
      </div>

      {answered && (
        <button
          ref={nextButton}
          type="button"
          onClick={next}
          className={`pressable min-h-12 rounded-full bg-primary px-6 font-semibold text-on-primary ${review ? 'min-h-14 self-end text-[17px]' : ''}`}
        >
          {last ? finishLabel : t('quiz.next')}
        </button>
      )}
    </div>
  );
}
