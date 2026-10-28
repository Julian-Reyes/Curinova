import { useTranslation } from 'react-i18next';

/**
 * The bar floating over the feed (Concept E): a title on the left (the wordmark, or the
 * trail's exit pill) and segmented progress on the right. No segments for open-ended
 * sessions (total null).
 */
export function FeedHeader({
  title,
  current,
  total,
}: {
  title: React.ReactNode;
  current: number;
  total: number | null;
}) {
  const { t } = useTranslation();
  return (
    <div className="feed-header">
      <div className="min-w-0">{title}</div>
      {total !== null && total > 0 && (
        <div
          className="feed-segs"
          role="img"
          aria-label={t('card.sessionCount', { current, total })}
        >
          {Array.from({ length: total }, (_, i) => (
            <i key={i} className={i < current ? 'is-on' : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
