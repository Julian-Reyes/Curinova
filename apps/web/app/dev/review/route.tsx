import { useSearchParams } from 'react-router';
import { LessonScreen } from './Lesson';
import { QueueScreen } from './Queue';

export function meta() {
  return [{ title: 'Content review (dev)' }];
}

/**
 * /_review: the content review tool (§5.5 step 6, D20). Dev server only (routes.ts); reads
 * content/drafts/ and writes reviewed lessons to content/lessons/ through the dev API.
 */
export default function ReviewRoute() {
  const [params, setParams] = useSearchParams();
  const lesson = params.get('lesson');
  return (
    <main className="min-h-dvh bg-bg text-ink">
      {lesson ? (
        <LessonScreen
          key={lesson}
          lessonKey={lesson}
          onNavigate={(key) => {
            setParams({ lesson: key });
          }}
        />
      ) : (
        <QueueScreen />
      )}
    </main>
  );
}
