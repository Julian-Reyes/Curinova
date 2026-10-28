import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, ChevronUpIcon } from '../../components/icons';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface FeedApi {
  goTo: (index: number) => void;
}

export interface FeedSlide {
  key: string;
  /** Lesson slides count toward position; others (end-of-session…) don't. */
  render: (state: { active: boolean; near: boolean }) => React.ReactNode;
  label: string;
}

/** Slides further than this from the active one render as lightweight placeholders. */
const RENDER_WINDOW = 2;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * Vertical one-card-at-a-time feed. Uses native CSS scroll snapping for swipes
 * (momentum and rubber-banding feel native on iOS and Android), plus buttons and
 * arrow keys. Only cards near the active one are fully rendered. The feed is always
 * dark (Concept E), whatever the app theme; `header` floats over the top of the cards.
 */
export function FeedView({
  slides,
  initialIndex = 0,
  onIndexChange,
  header,
  rail,
  apiRef,
}: {
  apiRef?: React.RefObject<FeedApi | null>;
  slides: FeedSlide[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  header?: React.ReactNode;
  rail?: (activeIndex: number) => React.ReactNode;
}) {
  const { t } = useTranslation();
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(Math.min(initialIndex, Math.max(0, slides.length - 1)));
  const reduced = useReducedMotion();
  const activeRef = useRef(active);
  // Where a scroll in progress is heading, so a second key press during the animation
  // moves one card further instead of being lost.
  const targetRef = useRef<number | null>(null);
  useEffect(() => {
    activeRef.current = active;
    if (targetRef.current === active) targetRef.current = null;
  }, [active]);

  // Restore the position instantly before first paint.
  useLayoutEffect(() => {
    const el = scroller.current?.children[active] as HTMLElement | undefined;
    if (el && scroller.current) scroller.current.scrollTop = el.offsetTop;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, []);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActive(index);
          }
        }
      },
      { root, threshold: 0.6 },
    );
    for (const child of Array.from(root.children)) observer.observe(child);
    // The learner swiping or scrolling themselves ends any queued move.
    const clearTarget = () => {
      targetRef.current = null;
    };
    // A programmatic smooth scroll can be cut short (busy device, snap re-evaluation):
    // when it stops before the target, jump the rest of the way.
    const onScrollEnd = () => {
      const index = targetRef.current;
      targetRef.current = null;
      const el = index === null ? undefined : (root.children[index] as HTMLElement | undefined);
      if (el && Math.abs(root.scrollTop - el.offsetTop) > 2) root.scrollTop = el.offsetTop;
    };
    root.addEventListener('scrollend', onScrollEnd);
    root.addEventListener('touchstart', clearTarget, { passive: true });
    root.addEventListener('wheel', clearTarget, { passive: true });
    return () => {
      observer.disconnect();
      root.removeEventListener('scrollend', onScrollEnd);
      root.removeEventListener('touchstart', clearTarget);
      root.removeEventListener('wheel', clearTarget);
    };
  }, [slides.length]);

  useEffect(() => {
    onIndexChange?.(active);
  }, [active, onIndexChange]);

  const goTo = useCallback(
    (index: number) => {
      const root = scroller.current;
      const target = root?.children[index] as HTMLElement | undefined;
      if (!root || !target) return;
      targetRef.current = index === activeRef.current ? null : index;
      const startTop = root.scrollTop;
      root.scrollTo({ top: target.offsetTop, behavior: reduced ? 'auto' : 'smooth' });
      // A busy browser occasionally drops a smooth scroll before it starts (then no
      // scrollend fires either): if nothing has moved shortly after, jump instead.
      window.setTimeout(() => {
        if (targetRef.current === index && root.scrollTop === startTop) {
          root.scrollTop = target.offsetTop;
        }
      }, 350);
    },
    [reduced],
  );

  useEffect(() => {
    if (apiRef) apiRef.current = { goTo };
  }, [apiRef, goTo]);

  // Keyboard navigation when no input or dialog has focus (§8).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isTypingTarget(e.target))
        return;
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      const from = targetRef.current ?? activeRef.current;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
        e.preventDefault();
        goTo(Math.min(from + 1, slides.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
        e.preventDefault();
        goTo(Math.max(from - 1, 0));
      }
    };
    window.addEventListener('keydown', onKey);
    // Signals that swipe/keyboard handling is live (used by E2E tests to avoid racing it).
    scroller.current?.setAttribute('data-ready', 'true');
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [goTo, slides.length]);

  return (
    <div className="feed-frame relative mx-auto flex h-full w-full justify-center gap-6 lg:px-6">
      <div
        className="feed-column relative flex h-full w-full max-w-[560px] flex-col lg:max-w-[500px]"
        data-theme="dark"
      >
        {header !== undefined && <div className="feed-overlay">{header}</div>}
        <div
          ref={scroller}
          className="feed-scroller min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
          aria-roledescription={t('feed.roledescription')}
          aria-label={t('feed.label')}
        >
          {slides.map((slide, i) => {
            const near = Math.abs(i - active) <= RENDER_WINDOW;
            return (
              <section
                key={slide.key}
                data-index={i}
                aria-label={t('feed.slideLabel', {
                  current: i + 1,
                  total: slides.length,
                  title: slide.label,
                })}
                aria-hidden={i !== active ? true : undefined}
                inert={i !== active ? true : undefined}
                className="feed-slide box-border h-full snap-start snap-always lg:py-5"
              >
                {near ? (
                  slide.render({ active: i === active, near })
                ) : (
                  <div className="feed-placeholder h-full" />
                )}
              </section>
            );
          })}
        </div>
        {/* Visible on desktop; on phones they are reachable by keyboard and screen readers. */}
        <div className="feed-nav pointer-events-none absolute top-1/2 -left-16 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
          <NavButton
            label={t('feed.previous')}
            disabled={active === 0}
            onClick={() => {
              goTo(active - 1);
            }}
          >
            <ChevronUpIcon />
          </NavButton>
          <NavButton
            label={t('feed.next')}
            disabled={active >= slides.length - 1}
            onClick={() => {
              goTo(active + 1);
            }}
          >
            <ChevronDownIcon />
          </NavButton>
        </div>
        <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:right-3 focus-within:bottom-3 focus-within:z-20 focus-within:flex focus-within:gap-2 lg:hidden">
          <NavButton
            label={t('feed.previous')}
            disabled={active === 0}
            onClick={() => {
              goTo(active - 1);
            }}
          >
            <ChevronUpIcon />
          </NavButton>
          <NavButton
            label={t('feed.next')}
            disabled={active >= slides.length - 1}
            onClick={() => {
              goTo(active + 1);
            }}
          >
            <ChevronDownIcon />
          </NavButton>
        </div>
      </div>
      {rail && (
        <aside className="hidden h-full w-[300px] shrink-0 overflow-y-auto py-5 xl:block">
          {rail(active)}
        </aside>
      )}
    </div>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="pressable pointer-events-auto flex size-12 items-center justify-center rounded-full bg-surface text-ink shadow-card ring-1 ring-line hover:bg-sunken disabled:opacity-40"
    >
      {children}
    </button>
  );
}
