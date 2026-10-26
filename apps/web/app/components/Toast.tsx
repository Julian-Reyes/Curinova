import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface Toast {
  id: number;
  message: string;
}

const ToastContext = createContext<(message: string) => void>(() => undefined);

/** Brief, polite status messages ("Saved to Library"). Announced to screen readers. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((message: string) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message });
    timer.current = setTimeout(() => {
      setToast(null);
    }, 2600);
  }, []);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-height)+var(--safe-bottom)+16px)] z-[60] flex justify-center px-4 lg:bottom-8"
      >
        {toast && (
          <div
            key={toast.id}
            className="toast-in rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-bg shadow-card"
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): (message: string) => void {
  return useContext(ToastContext);
}
