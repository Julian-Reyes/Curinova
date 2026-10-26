import type { Topic } from '@lumen/domain';
import { useApp } from '../data/app-context';
import { CheckIcon } from './icons';
import { TopicIcon, topicTint } from './TopicIcon';

/** Multi-select chip for choosing interests or muting topics. */
export function TopicChip({
  topic,
  selected,
  onToggle,
  tone = 'select',
}: {
  topic: Topic;
  selected: boolean;
  onToggle: () => void;
  tone?: 'select' | 'mute';
}) {
  const { prefs } = useApp();
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`pressable flex min-h-12 items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 text-left text-[15px] font-semibold ring-1 ${
        selected
          ? tone === 'mute'
            ? 'bg-danger-soft text-ink ring-danger'
            : 'bg-accent-soft text-ink ring-primary'
          : 'bg-surface text-ink ring-line-strong hover:ring-primary'
      }`}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: topicTint(topic.accentColor, 0.22) }}
      >
        {selected && tone === 'select' ? (
          <CheckIcon size={18} strokeWidth={2.6} />
        ) : (
          <TopicIcon icon={topic.icon} size={18} />
        )}
      </span>
      {topic.name[prefs.locale]}
    </button>
  );
}
