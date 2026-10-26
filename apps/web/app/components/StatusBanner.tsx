import { useLayoutEffect, useRef } from 'react';
import { OfflineIcon } from './icons';

/**
 * Full-width status line (offline, storage blocked). It publishes its height as
 * --banner-h so full-height screens like the feed shrink to fit below it instead
 * of being pushed under the bottom navigation. It also absorbs the top safe area.
 */
export function StatusBanner({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el) return;
    const update = () => {
      root.style.setProperty('--banner-h', `${el.getBoundingClientRect().height}px`);
      root.style.setProperty('--feed-safe-top', '0px');
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--banner-h');
      root.style.removeProperty('--feed-safe-top');
    };
  }, []);
  return (
    <div
      ref={ref}
      role="status"
      className="sticky top-0 z-20 flex items-center gap-2 bg-ink px-4 py-2 pt-[calc(var(--safe-top)+8px)] text-sm text-bg"
    >
      <OfflineIcon size={18} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}
