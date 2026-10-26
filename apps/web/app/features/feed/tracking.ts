import type { LessonVariant } from '@lumen/domain';
import { useEffect, useRef } from 'react';
import { useApp } from '../../data/app-context';
import { progress } from '../../data/progress';
import { useSession } from './session';

/**
 * A card counts as "opened" once it is the active card, and as "completed" when the
 * learner stays on it for a conservative share of its reading time (at least 40%,
 * never less than 6 s) or finishes its quiz. Flashing past a card counts as neither (§10.4).
 */
export const COMPLETE_MIN_MS = 6000;
export const COMPLETE_SHARE = 0.4;

export function completionThresholdMs(readingSeconds: number): number {
  return Math.max(COMPLETE_MIN_MS, readingSeconds * 1000 * COMPLETE_SHARE);
}

export function useLessonTracking(
  variant: LessonVariant | undefined,
  active: boolean,
  onOpened?: (conceptId: string) => void,
) {
  const { library, reportStorageError } = useApp();
  const { trackedOpen, trackedComplete } = useSession();
  const since = useRef<number | null>(null);

  useEffect(() => {
    if (!variant || !active) return;
    const { conceptId, locale } = variant;
    onOpened?.(conceptId);
    if (!trackedOpen.has(conceptId)) {
      trackedOpen.add(conceptId);
      progress.record('lesson_opened', conceptId, locale).catch(reportStorageError);
    }
    since.current = Date.now();
    const threshold = completionThresholdMs(library.readingSeconds(variant));
    const timer = setTimeout(() => {
      markCompleted(conceptId, locale);
    }, threshold);
    return () => {
      clearTimeout(timer);
      since.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the active lesson changes
  }, [variant?.id, active]);

  function markCompleted(conceptId: string, locale: LessonVariant['locale']) {
    if (trackedComplete.has(conceptId)) return;
    trackedComplete.add(conceptId);
    progress.record('lesson_completed', conceptId, locale).catch(reportStorageError);
  }

  return {
    markCompleted: () => {
      if (variant) markCompleted(variant.conceptId, variant.locale);
    },
  };
}
