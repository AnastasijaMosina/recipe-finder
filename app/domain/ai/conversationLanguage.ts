export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export function detectSupportedLanguage(browserLocale: string): SupportedLanguage {
  const code = browserLocale.split('-')[0].toLowerCase();
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code)
    ? (code as SupportedLanguage)
    : DEFAULT_LANGUAGE;
}
