export const LOCALES = ['pt-BR', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt-BR';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** §3.1: `pt-*` → pt-BR, anything else → en. Uses the first language the browser reports. */
export function resolveLocale(languages: readonly string[] | undefined): Locale {
  const first = languages?.find((l) => l.trim() !== '');
  if (first === undefined) return DEFAULT_LOCALE;
  return first.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'pt-BR' ? 'en' : 'pt-BR';
}
