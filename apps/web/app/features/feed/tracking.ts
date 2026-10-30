import type { LessonVariant } from '@lumen/domain';
import { useEffect, useRef } from 'react';
import { useApp, useProgress } from '../../data/app-context';
import { useSession } from './session';

/**
 * A card counts as "opened" once it is the active card, and as "completed" when the
 * learner stays on the short Discover card for 6 s, keeps Go Deeper open for 40% of the
 * lesson's reading time (DeeperSheet), or finishes its quiz (D15). Flashing past a card
 * counts as neither (§10.4).
 */
export const COMPLETE_MIN_MS = 6000;

export function useLessonTracking(
  variant: LessonVariant | undefined,
  active: boolean,
  onOpened?: (conceptId: string) => void,
) {
  const { reportStorageError } = useApp();
  const progress = useProgress();
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
    const timer = setTimeout(() => {
      markCompleted(conceptId, locale);
    }, COMPLETE_MIN_MS);
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
