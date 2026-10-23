import { CODENAME } from '@lumen/domain';

/*
 * PERMANENT storage identifiers. Renaming any of these silently wipes or orphans
 * guest data (preferences, progress, bookmarks). They use the internal codename,
 * never the display name. See docs/DECISIONS.md → "Renaming the product".
 */
export const DB_NAME = CODENAME;
export const STORAGE_KEYS = {
  /** Mirrors of preferences read synchronously before first paint (theme, locale, motion). */
  theme: `${CODENAME}.theme`,
  locale: `${CODENAME}.locale`,
  motion: `${CODENAME}.motion`,
} as const;
export const SW_CACHE_ID = CODENAME;

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the in-memory value still applies this session.
  }
}

/**
 * Runs before React hydrates (inlined in <head>) so the first paint already has the
 * right theme, language and motion setting. Keep it dependency-free ES5.
 */
export const BOOT_SCRIPT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('${STORAGE_KEYS.theme}')||'system';var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.setAttribute('data-theme',dark?'dark':'light');var l=localStorage.getItem('${STORAGE_KEYS.locale}');if(l!=='pt-BR'&&l!=='en'){var n=((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();l=n.indexOf('pt')===0||n===''?'pt-BR':'en';}d.setAttribute('lang',l);if(localStorage.getItem('${STORAGE_KEYS.motion}')==='reduce')d.setAttribute('data-motion','reduce');}catch(e){d.setAttribute('data-theme','light');}})();`;
