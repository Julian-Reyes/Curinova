import type { Theme } from '@lumen/domain';
import { STORAGE_KEYS, writeStorage } from './storage-keys';

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applies a theme to <html> and mirrors it for the pre-paint boot script. */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', resolveTheme(theme));
  writeStorage(STORAGE_KEYS.theme, theme);
}

/** Re-applies the theme when the OS setting changes while "system" is selected. */
export function watchSystemTheme(theme: Theme): () => void {
  if (theme !== 'system') return () => undefined;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    applyTheme('system');
  };
  media.addEventListener('change', onChange);
  return () => {
    media.removeEventListener('change', onChange);
  };
}
