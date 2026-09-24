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