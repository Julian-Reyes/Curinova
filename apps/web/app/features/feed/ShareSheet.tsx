import { storyImageUrl, type LessonVariant } from '@lumen/domain';
import { useTranslation } from 'react-i18next';
import { ImageIcon, LinkIcon } from '../../components/icons';
import { Sheet } from '../../components/Sheet';
import { useProgress, useApp } from '../../data/app-context';
import { useShareLesson, useShareStoryImage, useStoryImage } from './share';

/**
 * Share choices (§7.4): the story image of the card for Instagram Stories and WhatsApp Status,
 * or the link to the lesson's public page. Where the browser can't share image files (most
 * computers), the image is saved instead.
 */
export function ShareSheet({
  open,
  onOpenChange,
  variant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: LessonVariant;
}) {
  const { t } = useTranslation();
  const { reportStorageError } = useApp();
  const progress = useProgress();
  const shareLink = useShareLesson();
  const shareImage = useShareStoryImage();
  const image = useStoryImage(variant, open);
  const src = storyImageUrl(variant.locale, variant.slug);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('share.title')}
      description={variant.title}
    >
      <div className="flex flex-col items-center gap-4">
        {image.state === 'failed' ? (
          <p className="share-story is-missing">{t('share.imageOffline')}</p>
        ) : (
          <img
            src={src}
            alt={t('share.imageAlt')}
            width={1080}
            height={1920}
            className="share-story"
          />
        )}
        <p className="text-center text-sm text-muted">{t('share.imageHint')}</p>
        <div className="flex w-full flex-col gap-2">
          {image.state === 'ready' && !image.shareable ? (
            <a
              href={src}
              download={image.file.name}
              className="deeper-pill is-solid pressable"
              onClick={() => {
                progress
                  .record('share_clicked', variant.conceptId, variant.locale)
                  .catch(reportStorageError);
              }}
            >
              <ImageIcon size={20} />
              {t('share.saveImage')}
            </a>
          ) : (
            <button
              type="button"
              className="deeper-pill is-solid pressable disabled:opacity-50"
              disabled={image.state !== 'ready'}
              onClick={() => {
                if (image.state === 'ready') void shareImage(variant, image.file);
              }}
            >
              <ImageIcon size={20} />
              {t('share.asImage')}
            </button>
          )}
          <button
            type="button"
            className="deeper-pill pressable"
            onClick={() => void shareLink(variant)}
          >
            <LinkIcon size={20} />
            {t('share.link')}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
