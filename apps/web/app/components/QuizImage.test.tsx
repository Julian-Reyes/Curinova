import { render, screen } from '@testing-library/react';
import type { Concept, LessonVariant, Topic } from '@lumen/domain';
import { describe, expect, it } from 'vitest';
import { QuizImage } from './QuizImage';

const topic = { id: 'space', icon: 'space', accentColor: '#3D5A99' } as unknown as Topic;
const variant = { conceptId: 'concept_moon', locale: 'en' } as unknown as LessonVariant;
const review = {
  width: 1000,
  height: 562,
  alt: { 'pt-BR': 'A Lua cheia', en: 'The full Moon' },
  origin: { kind: 'original' },
  accuracyReviewedBy: null,
  addedAt: '2026-10-30',
  hash: '0123abcd',
};
const withImage = { id: 'concept_moon', media: { review } } as unknown as Concept;
const withoutImage = { id: 'concept_moon' } as unknown as Concept;

describe('QuizImage (D15)', () => {
  it("shows the lesson's Review image with its alt text", () => {
    render(<QuizImage concept={withImage} variant={variant} topic={topic} />);
    expect(screen.getByRole('img', { name: 'The full Moon' })).toBeTruthy();
  });

  it('shows nothing after a lesson with no Review image', () => {
    const { container } = render(
      <QuizImage concept={withoutImage} variant={variant} topic={topic} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('falls back to the topic panel in the Review tab', () => {
    const { container } = render(
      <QuizImage concept={withoutImage} variant={variant} topic={topic} fallback />,
    );
    expect(container.querySelector('.review-ill')).not.toBeNull();
    expect(screen.queryByRole('img', { name: 'The full Moon' })).toBeNull();
  });
});
