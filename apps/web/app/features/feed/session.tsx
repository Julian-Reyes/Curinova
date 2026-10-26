import { isDue, rankFeed, type FeedItem, type SessionGoal } from '@lumen/domain';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useApp } from '../../data/app-context';
import { db } from '../../data/db';
import { progress } from '../../data/progress';
import { newId } from '../../platform/ids';

export interface DiscoverSession {
  sessionId: string;
  seed: number;
  items: FeedItem[];
  exhausted: boolean;
  allMuted: boolean;
  goal: SessionGoal;
  /** The learner chose "Keep exploring" after the soft stop. */
  extended: boolean;
  /** The learner chose "Done" at the soft stop. */
  finished: boolean;
  /** Feed position, restored when returning from a trail or another tab. */
  index: number;
  opened: Set<string>;
  quizzes: number;
  /** Due reviews at session start; > 0 in "remember more" mode shows a review card (P7). */
  dueAtStart: number;
}

interface SessionContextValue {
  session: DiscoverSession | null;
  start: (options?: { recycle?: boolean }) => Promise<void>;
  update: (patch: Partial<DiscoverSession>) => void;
  /** Concepts already recorded as opened/completed in this app run (dedupes events). */
  trackedOpen: Set<string>;
  trackedComplete: Set<string>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Holds the Discover feed for the whole app run, so switching tabs or entering a
 * trail never loses the learner's place. A new session ranks the catalog once;
 * cards never jump mid-session (§6).
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { library, prefs, reportStorageError } = useApp();
  const [session, setSession] = useState<DiscoverSession | null>(null);
  // Mutable sets that live as long as the provider; never replaced, so no re-renders.
  const [trackedOpen] = useState(() => new Set<string>());
  const [trackedComplete] = useState(() => new Set<string>());

  const start = useCallback(
    async (options: { recycle?: boolean } = {}) => {
      let seen = new Set<string>();
      const engagement = new Map<string, number>();
      let dueAtStart = 0;
      try {
        const now = new Date();
        dueAtStart = (await db.reviews.toArray()).filter(
          (r) => library.concept(r.conceptId) !== undefined && isDue(r, now, prefs.timezone),
        ).length;
        const events = await db.events.toArray();
        for (const e of events) {
          if (e.type === 'lesson_opened') seen.add(e.conceptId);
          if (
            e.type === 'lesson_completed' ||
            e.type === 'bookmark_changed' ||
            (e.type === 'quiz_answered' && e.response?.correct === true)
          ) {
            const clusterId = library.concept(e.conceptId)?.clusterId;
            if (clusterId) engagement.set(clusterId, (engagement.get(clusterId) ?? 0) + 1);
          }
        }
      } catch {
        reportStorageError();
      }
      if (options.recycle === true) seen = new Set();
      const seed = Math.floor(Math.random() * 2 ** 31);
      const result = rankFeed({
        concepts: library.concepts.map((c) => ({
          conceptId: c.id,
          topicId: c.topicId,
          clusterId: c.clusterId,
          clusterOrder: c.clusterOrder,
        })),
        interests: prefs.interests,
        mutedTopics: prefs.mutedTopics,
        seen,
        clusterEngagement: engagement,
        clusterLinks: new Map(library.clusters.map((c) => [c.id, c.links.map((l) => l.clusterId)])),
        seed,
        purpose: prefs.purpose,
      });
      const next: DiscoverSession = {
        sessionId: newId(),
        seed,
        items: result.items,
        exhausted: result.exhausted,
        allMuted: result.allMuted,
        goal: prefs.sessionGoal,
        extended: false,
        finished: false,
        index: 0,
        opened: new Set(),
        quizzes: 0,
        dueAtStart,
      };
      setSession(next);
      void db.sessions
        .put({
          sessionId: next.sessionId,
          startedAt: new Date().toISOString(),
          goal: next.goal,
          completedConceptIds: [],
        })
        .catch(reportStorageError);
    },
    [
      library,
      prefs.interests,
      prefs.mutedTopics,
      prefs.sessionGoal,
      prefs.purpose,
      prefs.timezone,
      reportStorageError,
    ],
  );

  const update = useCallback((patch: Partial<DiscoverSession>) => {
    setSession((s) => (s ? { ...s, ...patch } : s));
  }, []);

  const value = useMemo(
    () => ({ session, start, update, trackedOpen, trackedComplete }),
    [session, start, update, trackedOpen, trackedComplete],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (value === null) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}

/** Ends the current session: records it and the session_finished event. */
export async function finishSession(
  session: DiscoverSession,
  lastConceptId: string | undefined,
  locale: 'pt-BR' | 'en',
) {
  const endedAt = new Date().toISOString();
  await db.sessions.update(session.sessionId, {
    endedAt,
    completedConceptIds: [...session.opened],
  });
  if (lastConceptId !== undefined) await progress.record('session_finished', lastConceptId, locale);
}
