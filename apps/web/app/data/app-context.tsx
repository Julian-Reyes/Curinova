import {
  computeStats,
  isDue,
  type ProgressStats,
  type Bookmark,
  type ProgressEvent,
  type ReviewState,
  type UserPreferences,
} from '@lumen/domain';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS, writeStorage } from '../platform/storage-keys';
import { applyTheme, watchSystemTheme } from '../platform/theme';
import { db } from './db';
import type { Library } from './library';
import { progress } from './progress';

interface AppContextValue {
  library: Library;
  prefs: UserPreferences;
  updatePrefs: (patch: Partial<UserPreferences>) => void;
  /** False when IndexedDB is unavailable (e.g. blocked storage): progress won't persist. */
  storageOk: boolean;
  reportStorageError: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  library,
  initialPrefs,
  initialStorageOk,
  children,
}: {
  library: Library;
  initialPrefs: UserPreferences;
  initialStorageOk: boolean;
  children: React.ReactNode;
}) {
  const { i18n } = useTranslation();
  const [prefs, setPrefs] = useState(initialPrefs);
  const [storageOk, setStorageOk] = useState(initialStorageOk);
  const first = useRef(true);

  // Apply preferences to the document and i18n whenever they change.
  useEffect(() => {
    applyTheme(prefs.theme);
    writeStorage(STORAGE_KEYS.locale, prefs.locale);
    writeStorage(STORAGE_KEYS.motion, prefs.reducedMotion);
    document.documentElement.lang = prefs.locale;
    if (prefs.reducedMotion === 'reduce')
      document.documentElement.setAttribute('data-motion', 'reduce');
    else document.documentElement.removeAttribute('data-motion');
    if (i18n.language !== prefs.locale) void i18n.changeLanguage(prefs.locale);
    return watchSystemTheme(prefs.theme);
  }, [prefs.theme, prefs.locale, prefs.reducedMotion, i18n]);

  // Persist on change (skip the initial value, which came from storage).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    progress.savePreferences(prefs).catch(() => {
      setStorageOk(false);
    });
  }, [prefs]);

  const updatePrefs = useCallback((patch: Partial<UserPreferences>) => {
    setPrefs((current) => ({ ...current, ...patch }));
  }, []);
  const reportStorageError = useCallback(() => {
    setStorageOk(false);
  }, []);

  const value = useMemo(
    () => ({ library, prefs, updatePrefs, storageOk, reportStorageError }),
    [library, prefs, updatePrefs, storageOk, reportStorageError],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (value === null) throw new Error('useApp must be used inside <AppProvider>');
  return value;
}

const EMPTY_BOOKMARKS: Bookmark[] = [];
const EMPTY_EVENTS: ProgressEvent[] = [];
const EMPTY_REVIEWS: ReviewState[] = [];

export function useBookmarks(): Bookmark[] {
  return useLiveQuery(() => db.bookmarks.toArray(), [], EMPTY_BOOKMARKS);
}

export function useSavedIds(): Set<string> {
  const bookmarks = useBookmarks();
  return useMemo(
    () => new Set(bookmarks.filter((b) => b.saved).map((b) => b.conceptId)),
    [bookmarks],
  );
}

export function useEvents(): ProgressEvent[] {
  return useLiveQuery(() => db.events.orderBy('occurredAt').toArray(), [], EMPTY_EVENTS);
}

export function useReviews(): ReviewState[] {
  return useLiveQuery(() => db.reviews.toArray(), [], EMPTY_REVIEWS);
}

/** Review states due now in the learner's time zone, restricted to concepts in the library. */
export function useDueReviews(): ReviewState[] {
  const { library, prefs } = useApp();
  const reviews = useReviews();
  return useMemo(() => {
    const now = new Date();
    return reviews
      .filter((r) => library.concept(r.conceptId) !== undefined && isDue(r, now, prefs.timezone))
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  }, [reviews, library, prefs.timezone]);
}

/**
 * Progress statistics, or null while the stores are still being read, so the
 * dashboard never flashes misleading zeros.
 */
export function useStats(): ProgressStats | null {
  const { library, prefs } = useApp();
  const data = useLiveQuery(
    async () => ({
      events: await db.events.toArray(),
      reviews: await db.reviews.toArray(),
      bookmarks: await db.bookmarks.toArray(),
    }),
    [],
  );
  return useMemo(
    () =>
      data === undefined
        ? null
        : computeStats({
            ...data,
            conceptTopics: new Map(library.concepts.map((c) => [c.id, c.topicId])),
            clusters: new Map(library.clusters.map((c) => [c.id, c.conceptIds])),
            now: new Date(),
            timeZone: prefs.timezone,
          }),
    [data, library, prefs.timezone],
  );
}

/** Concepts the learner has opened (seen) and completed, from the event log. */
export function useSeen(): { seen: Set<string>; completed: Set<string> } {
  const events = useEvents();
  return useMemo(() => {
    const seen = new Set<string>();
    const completed = new Set<string>();
    for (const e of events) {
      if (e.type === 'lesson_opened') seen.add(e.conceptId);
      if (e.type === 'lesson_completed') completed.add(e.conceptId);
    }
    return { seen, completed };
  }, [events]);
}
