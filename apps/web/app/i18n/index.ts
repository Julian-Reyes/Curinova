import { BRAND, DEFAULT_LOCALE, type Locale } from '@lumen/domain';
import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

export const resources = { 'pt-BR': { translation: ptBR }, en: { translation: en } } as const;

/** Creates the i18n instance. The display name is injected as {{appName}}; never hard-code it. */
export function createI18n(locale: Locale = DEFAULT_LOCALE): i18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: false,
    supportedLngs: ['pt-BR', 'en'],
    initAsync: false,
    returnNull: false,
    interpolation: { escapeValue: false, defaultVariables: { appName: BRAND.name } },
  });
  return instance;
}
