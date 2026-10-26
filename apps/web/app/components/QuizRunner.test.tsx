import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { QuizQuestion } from '@lumen/domain';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import { createI18n } from '../i18n';
import { QuizRunner } from './QuizRunner';

const question: QuizQuestion = {
  id: 'q_moon_1__en',
  questionGroupId: 'qg_moon_1',
  conceptId: 'concept_moon',
  locale: 'en',
  prompt: 'How long does one lunar spin take?',
  options: [
    { id: 'a', text: 'About 27 days' },
    { id: 'b', text: 'About 24 hours' },
    { id: 'c', text: 'It does not spin' },
  ],
  correctOptionId: 'a',
  explanation: 'One spin per orbit.',
  misconception: 'It does spin.',
  claimIds: [],
  status: 'draft',
};

function setup() {
  const onAnswer = vi.fn();
  const onFinish = vi.fn();
  render(
    <I18nextProvider i18n={createI18n('en')}>
      <QuizRunner
        questions={[question]}
        seed={1}
        onAnswer={onAnswer}
        onFinish={onFinish}
        finishLabel="See result"
      />
    </I18nextProvider>,
  );
  return { onAnswer, onFinish };
}

describe('QuizRunner (§3.3)', () => {
  it('hides the answer until a choice, then explains the misconception on a wrong answer', async () => {
    const { onAnswer, onFinish } = setup();
    expect(screen.queryByText('One spin per orbit.')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'About 24 hours' }));
    expect(onAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ selectedOptionId: 'b', correct: false }),
    );
    expect(screen.getByText(/Not quite\. The right answer is: About 27 days/)).toBeTruthy();
    expect(screen.getByText('It does spin.')).toBeTruthy();
    // Options lock after answering; the next button takes focus.
    expect(screen.getByRole('button', { name: 'About 27 days' }).hasAttribute('disabled')).toBe(
      true,
    );
    await userEvent.click(screen.getByRole('button', { name: 'See result' }));
    expect(onFinish).toHaveBeenCalledWith([expect.objectContaining({ correct: false })]);
  });

  it('confirms a correct answer', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'About 27 days' }));
    expect(screen.getByText("That's right!")).toBeTruthy();
    expect(screen.queryByText('It does spin.')).toBeNull();
  });
});
