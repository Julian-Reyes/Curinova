import { isPublishedVariant, storyImageUrl, type LessonVariant } from '@lumen/domain';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/Toast';
import { useApp, useProgress } from '../../data/app-context';
import { publicPath } from '../../public/paths';

/** Only published lessons have a public page and story image to share (§7.1); drafts have none. */
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

export type StoryImage =
  | { state: 'loading' }
  | { state: 'failed' }
  /** `shareable`: the share sheet takes image files here; otherwise the image is saved. */
  | { state: 'ready'; file: File; shareable: boolean };

/**
 * Fetches a lesson's story image (1080×1920, made at build time) while the Share sheet is open,
 * so tapping "Share as image" can open the share sheet at once: Safari refuses a share that
 * starts after a network wait.
 */
export function useStoryImage(variant: LessonVariant, open: boolean): StoryImage {
  const url = storyImageUrl(variant.locale, variant.slug);
  // Keyed by URL, so a card never shows another lesson's image while its own loads.
  const [image, setImage] = useState<{ url: string; image: StoryImage } | null>(null);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`story image: HTTP ${String(response.status)}`);
        const file = new File([await response.blob()], `${variant.slug}.jpg`, {
          type: 'image/jpeg',
        });
        const shareable =
          typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
        if (!cancelled) setImage({ url, image: { state: 'ready', file, shareable } });
      })
      .catch(() => {
        if (!cancelled) setImage({ url, image: { state: 'failed' } });
      });
    return () => {
      cancelled = true;
    };
  }, [open, url, variant.slug]);
  return image?.url === url ? image.image : { state: 'loading' };
}

/** Shares the story image through the share sheet (Instagram Stories, WhatsApp Status…). */
export function useShareStoryImage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { reportStorageError } = useApp();
  const progress = useProgress();
  return async (variant: LessonVariant, file: File) => {
    progress.record('share_clicked', variant.conceptId, variant.locale).catch(reportStorageError);
    try {
      await navigator.share({ files: [file], title: variant.title });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast(t('share.imageFailed'));
    }
  };
}
