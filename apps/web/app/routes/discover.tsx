import type { FeedReason } from '@lumen/domain';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useApp, useSavedIds } from '../data/app-context';
import { FeedRail } from '../features/feed/FeedRail';
import { FeedHeader } from '../features/feed/FeedHeader';
import { FeedView, type FeedApi, type FeedSlide } from '../features/feed/FeedView';
import { LessonCard } from '../features/feed/LessonCard';
import { trailHref } from '../features/feed/LessonSheets';
import { useSession } from '../features/feed/session';
import { AllMutedSlide, ReviewPromptSlide, SeenItAllSlide } from '../features/feed/Slides';

/** A skippable "quick review?" card after this many lessons, when reviews are due (D17). */
const NUDGE_EVERY = 20;
/** Add another pass of repeats when the learner gets this close to the end. */
const EXTEND_WITHIN = 3;

/**
 * The Discover feed never ends (D17): unseen lessons ranked for the learner (chosen
 * topics first, others mixed in), then one honest "you've seen everything new" note,
 * then every lesson again, seen longest ago first, pass after pass.
 */
export default function Discover() {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
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

  // Near the end of what's loaded, add another pass of repeats.
  useEffect(() => {
    if (!session || session.repeats.length === 0) return;
    const loaded = session.items.length + (session.passes + 1) * session.repeats.length;
    if (session.index >= loaded - EXTEND_WITHIN) update({ passes: session.passes + 1 });
  }, [session, update]);

  if (session === null) return <div className="feed-height" aria-busy="true" />;

  const entries: { conceptId: string; reason: FeedReason | undefined; key: string }[] = [
    ...session.items.map((i) => ({ conceptId: i.conceptId, reason: i.reason, key: i.conceptId })),
  ];
  const repeatsFrom = entries.length;
  for (let pass = 0; pass <= session.passes; pass += 1)
    for (const id of session.repeats)
      entries.push({ conceptId: id, reason: undefined, key: `${id}:${String(pass)}` });

  const slides: FeedSlide[] = [];
  const concepts: (string | undefined)[] = [];
  const push = (slide: FeedSlide, conceptId?: string) => {
    slides.push(slide);
    concepts.push(conceptId);
  };
  const reviewNudge = (key: string) => {
    const at = slides.length;
    push({
      key,
      label: t('reviewPrompt.title'),
      render: () => (
        <ReviewPromptSlide
          due={session.dueAtStart}
          onSkip={() => {
            api.current?.goTo(at + 1);
          }}
        />
      ),
    });
  };

  if (session.allMuted) {
    push({ key: 'all-muted', label: t('feed.allMutedTitle'), render: () => <AllMutedSlide /> });
  } else {
    let lessons = 0;
    entries.forEach((entry, i) => {
      if (i === repeatsFrom)
        push({ key: 'seen-all', label: t('feed.seenAllTitle'), render: () => <SeenItAllSlide /> });
      const concept = library.concept(entry.conceptId);
      const variant = concept ? library.variant(concept.id, prefs.locale) : undefined;
      if (!concept || !variant) return;
      push(
        {
          key: entry.key,
          label: variant.title,
          render: ({ active }) => (
            <LessonCard
              concept={concept}
              variant={variant}
              active={active}
              saved={saved.has(concept.id)}
              reason={entry.reason}
              seed={session.seed}
              emphasizeQuiz={prefs.purpose === 'remember'}
              onOpened={(id) => {
                if (!session.opened.has(id)) update({ opened: new Set([...session.opened, id]) });
              }}
              onQuizDone={() => {
                update({ quizzes: session.quizzes + 1 });
              }}
              onNextInTrail={(nextId) => {
                const href = trailHref(library, nextId, prefs.locale, '/app/discover');
                if (href) void navigate(href);
              }}
            />
          ),
        },
        concept.id,
      );
      lessons += 1;
      if (session.dueAtStart > 0) {
        // "Remember more" (P7): an early invitation; everyone: a gentle one every 20 lessons.
        if (lessons === 1 && prefs.purpose === 'remember') reviewNudge('review-prompt');
        else if (lessons % NUDGE_EVERY === 0) reviewNudge(`review-nudge-${String(lessons)}`);
      }
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
        header={
          <FeedHeader
            title={<span className="feed-brand">{t('app.name')}</span>}
            current={session.index + 1}
            total={null}
          />
        }
        rail={(index) => <FeedRail conceptId={concepts[index]} />}
      />
    </div>
  );
}
