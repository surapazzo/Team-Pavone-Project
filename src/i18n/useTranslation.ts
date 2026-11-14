/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import it from './locales/it.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import { SupportedLocale } from '../types';
import { useApp } from '../context/AppContext';

const DICTIONARIES: Record<SupportedLocale, typeof it> = {
  it,
  en,
  es,
  de,
  fr,
};

export const SUPPORTED_LOCALES: Array<{ code: SupportedLocale; label: string; ready: boolean }> = [
  { code: 'it', label: 'IT · Italiano', ready: true },
  { code: 'en', label: 'EN · English', ready: true },
  { code: 'es', label: 'ES · Español', ready: true },
  { code: 'de', label: 'DE · Deutsch', ready: true },
  { code: 'fr', label: 'FR · Français', ready: true },
];

export function useTranslation() {
  const { locale, setLocale } = useApp();
  const dict = DICTIONARIES[locale] || DICTIONARIES.it;

  const t = (path: string): string => {
    const parts = path.split('.');
    let current: unknown = dict;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return path;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  return { t, locale, setLocale, dict };
}
