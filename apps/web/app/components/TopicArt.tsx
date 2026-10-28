import { topicImageUrl, type Topic } from '@lumen/domain';
import { useState } from 'react';
import { TopicIcon } from './TopicIcon';

/**
 * A topic's picture for Explore tiles and the topic page, or its icon on a dark topic
 * gradient when it has none (or it can't load offline). Decorative: the topic name is
 * always written next to it.
 */
export function TopicArt({ topic, size }: { topic: Topic; size: 'sm' | 'full' }) {
  const [failed, setFailed] = useState(false);
  const image = topic.image;
  if (image && !failed) {
    return (
      <img
        src={topicImageUrl(topic.id, size, image.hash)}
        width={image.width}
        height={image.height}
        alt=""
        loading={size === 'full' ? 'eager' : 'lazy'}
        decoding="async"
        className="topic-art"
        onError={() => {
          setFailed(true);
        }}
      />
    );
  }
  return (
    <span className="topic-art topic-art-icon" aria-hidden="true">
      <TopicIcon icon={topic.icon} size={size === 'full' ? 64 : 52} />
    </span>
  );
}

/** Minimal on-screen credit for a topic picture (P11): licensed photos only. */
export function topicImageCredit(topic: Topic): string | null {
  const origin = topic.image?.origin;
  if (origin?.kind !== 'licensed') return null;
  return origin.platform ? `${origin.creator}, ${origin.platform}` : origin.creator;
}
