import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useApp, useSavedIds } from '../data/app-context';
import { FeedRail } from '../features/feed/FeedRail';
import { FeedView, type FeedApi, type FeedSlide } from '../features/feed/FeedView';
import { LessonCard } from '../features/feed/LessonCard';
import { trailHref } from '../features/feed/LessonSheets';
import { finishSession, useSession } from '../features/feed/session';
import {
  AllMutedSlide,
  EndOfSessionSlide,
  ExhaustedSlide,
  FinishedSlide,
  ReviewPromptSlide,
} from '../features/feed/Slides';

export default function Discover() {
  const { t } = useTranslation();
  const { library, prefs, reportStorageError } = useApp();
  const { session, start, update } = useSession();
  const saved = useSavedIds();
  const navigate = useNavigate();
  const api = useRef<FeedApi>(null);

  useEffect(() => {
    if (session === null) void start();
  }, [session, start]);

  useEffect(() => {
    document.title = `${t('nav.discover')} · ${t('app.name')}`;
  }, [t]);

  const onIndexChange = useCallback(
    (index: number) => {
      update({ index });
    },
    [update],
  );

  if (session === null) return <div className="feed-height" aria-busy="true" />;

  const goal = session.goal === 'unlimited' ? Number.POSITIVE_INFINITY : session.goal;
  const showAll = session.extended || session.goal === 'unlimited';
  const lessons = showAll ? session.items : session.items.slice(0, goal);
  const total =
    session.goal === 'unlimited' || session.extended ? null : Math.min(goal, session.items.length);

  const slides: FeedSlide[] = lessons.flatMap((item, i) => {
    const concept = library.concept(item.conceptId);
    const variant = concept ? library.variant(concept.id, prefs.locale) : undefined;
    if (!concept || !variant) return [];
    return [
      {
        key: concept.id,
        label: variant.title,
        render: ({ active }) => (
          <LessonCard
            concept={concept}
            variant={variant}
            active={active}
            saved={saved.has(concept.id)}
            reason={item.reason}
            sessionProgress={{ current: i + 1, total }}
            seed={session.seed}
            emphasizeQuiz={prefs.purpose === 'remember'}
            onOpened={(id) => {
              if (!session.opened.has(id)) update({ opened: new Set([...session.opened, id]) });
            }}
            onQuizDone={() => {
              update({ quizzes: session.quizzes + 1 });
            }}
            onNextInTrail={(nextId) => {
              const href = trailHref(library, nextId, prefs.locale);
              if (href) void navigate(href);
            }}
          />
        ),
      },
    ];
  });

  // "Remember more" (P7): invite a review after the first lesson when reviews are due.
  if (prefs.purpose === 'remember' && session.dueAtStart > 0 && slides.length > 0) {
    slides.splice(1, 0, {
      key: 'review-prompt',
      label: t('reviewPrompt.title'),
      render: () => (
        <ReviewPromptSlide
          due={session.dueAtStart}
          onSkip={() => {
            api.current?.goTo(2);
          }}
        />
      ),
    });
  }

  if (session.allMuted) {
    slides.push({
      key: 'all-muted',
      label: t('feed.allMutedTitle'),
      render: () => <AllMutedSlide />,
    });
  } else if (session.finished) {
    slides.push({
      key: 'finished',
      label: t('session.finishedTitle'),
      render: () => <FinishedSlide onNewSession={() => void start()} />,
    });
  } else if (!showAll && session.items.length > lessons.length) {
    slides.push({
      key: 'end-of-session',
      label: t('session.title'),
      render: () => (
        <EndOfSessionSlide
          explored={session.opened.size}
          quizzes={session.quizzes}
          onKeepExploring={() => {
            update({ extended: true });
          }}
          onDone={() => {
            update({ finished: true });
            finishSession(session, lessons.at(-1)?.conceptId, prefs.locale).catch(
              reportStorageError,
            );
          }}
        />
      ),
    });
  } else {
    slides.push({
      key: 'exhausted',
      label: t('exhausted.title'),
      render: () => <ExhaustedSlide onRecycle={() => void start({ recycle: true })} />,
    });
  }

  return (
    <div className="feed-height">
      <FeedView
        key={session.sessionId}
        apiRef={api}
        slides={slides}
        initialIndex={session.index}
        onIndexChange={onIndexChange}
        rail={(index) => <FeedRail conceptId={lessons[index]?.conceptId} />}
      />
    </div>
  );
}
