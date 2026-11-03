import type { Concept, LessonVariant, Topic } from '@lumen/domain';
import { LessonArt } from './LessonArt';
import { TopicIcon } from './TopicIcon';

/**
 * The lesson's Review image above a quiz question's options (D15). The Review tab falls
 * back to the topic icon when a lesson has no Review image (`fallback`); the quiz after a
 * lesson shows nothing instead, so the sheet stays short.
 */
export function QuizImage({
  concept,
  variant,
  topic,
  fallback = false,
}: {
  concept: Concept;
  variant: LessonVariant;
  topic: Topic;
  fallback?: boolean;
}) {
  if (!concept.media?.review && !fallback) return null;
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
}
