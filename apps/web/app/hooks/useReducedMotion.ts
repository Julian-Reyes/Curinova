import { useEffect, useState } from 'react';
import { useApp } from '../data/app-context';

/** True when the OS asks for reduced motion or the learner turned it on in Settings. */
export function useReducedMotion(): boolean {
  const { prefs } = useApp();
  const [system, setSystem] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      setSystem(media.matches);
    };
    media.addEventListener('change', onChange);
    return () => {
      media.removeEventListener('change', onChange);
    };
  }, []);
  return system || prefs.reducedMotion === 'reduce';
}
