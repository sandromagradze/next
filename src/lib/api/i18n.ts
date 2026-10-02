export const SUPPORTED_LANGUAGES = [
  {
    code: "ka",
    label: "ქართული",
  },
  {
    code: "en",
    label: "English",
  },
] as const;

export type SupportedLanguageCode =
  (typeof SUPPORTED_LANGUAGES)[number]["code"];

export function isSupportedLanguageCode(
  value: string,
): value is SupportedLanguageCode {
  return SUPPORTED_LANGUAGES.some(
    ({ code }) => code === value,
  );
}