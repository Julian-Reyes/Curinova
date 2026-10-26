import * as Dialog from '@radix-ui/react-dialog';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from './icons';

/**
 * Accessible bottom sheet (dialog) on phones, centered panel on wide screens.
 * Radix handles focus trapping, Escape, scroll locking and focus restoration.
 * Dragging the handle down past a threshold closes it, like a native sheet.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  lang,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Set when the sheet content is in a lesson locale that may differ from the UI. */
  lang?: string;
}) {
  const { t } = useTranslation();
  const panel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { startY: e.clientY, dy: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !panel.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.startY);
    panel.current.style.transform = `translateY(${drag.current.dy}px)`;
    panel.current.style.transition = 'none';
  };
  const onPointerUp = () => {
    if (!drag.current || !panel.current) return;
    const { dy } = drag.current;
    drag.current = null;
    panel.current.style.transition = '';
    panel.current.style.transform = '';
    if (dy > 90) onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay fixed inset-0 z-50 bg-[var(--scrim)]" />
        <Dialog.Content
          ref={panel}
          className="sheet-panel fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-xl flex-col rounded-t-[28px] bg-surface pb-[var(--safe-bottom)] shadow-sheet outline-none lg:bottom-auto lg:top-1/2 lg:max-h-[80dvh] lg:-translate-y-1/2 lg:rounded-[28px]"
          {...(description === undefined ? { 'aria-describedby': undefined } : {})}
        >
          <div
            className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-1 lg:hidden"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-hidden="true"
          >
            <span className="h-1.5 w-10 rounded-full bg-line-strong" />
          </div>
          <div className="flex shrink-0 items-start gap-3 px-5 pt-2 pb-3 lg:pt-5" lang={lang}>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="font-display text-xl leading-snug font-semibold text-balance">
                {title}
              </Dialog.Title>
              {description !== undefined && (
                <Dialog.Description className="mt-1 text-sm text-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="pressable -mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-sunken hover:text-ink"
              aria-label={t('common.close')}
            >
              <CloseIcon size={22} />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5" lang={lang}>
            {children}
          </div>
          {footer !== undefined && (
            <div className="shrink-0 border-t border-line px-5 py-3">{footer}</div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
