import { isPublishedVariant, type LessonVariant } from '@lumen/domain';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/Toast';
import { useApp, useProgress } from '../../data/app-context';
import { publicPath } from '../../public/paths';

/** Only published lessons have a public page to share (§7.1); drafts have none. */
export function canShare(variant: LessonVariant): boolean {
  return isPublishedVariant(variant);
}

/**
 * Shares a lesson's public page (§7.4): the phone's share sheet where there is one,
 * otherwise the link is copied. Cancelling the share sheet is not an error.
 */
export function useShareLesson() {
  const { t } = useTranslation();
  const toast = useToast();
  const { reportStorageError } = useApp();
  const progress = useProgress();
  return async (variant: LessonVariant) => {
    const url = `${window.location.origin}${publicPath(variant.locale, 'lesson', variant.slug)}`;
    progress.record('share_clicked', variant.conceptId, variant.locale).catch(reportStorageError);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: variant.title, text: variant.title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        // Share sheet unavailable after all (e.g. not allowed here): copy the link instead.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast(t('card.linkCopied'));
    } catch {
      toast(t('card.shareFailed'));
    }
  };
}
