"use client";

import Link from "next/link";

interface LanguageChangeProps {
  locale: string;
}

const LANGUAGES = [
  {
    code: "ka",
    label: "ქართული",
  },
  {
    code: "en",
    label: "English",
  },
];

export default function LanguageChange({
  locale,
}: LanguageChangeProps) {
  return (
    <div className="flex items-center gap-2">
      {LANGUAGES.map((language) => (
        <Link
          key={language.code}
          href={`/${language.code}`}
          className={
            locale === language.code
              ? "font-bold text-blue-600"
              : "text-gray-500 hover:text-blue-600"
          }
        >
          {language.label}
        </Link>
      ))}
    </div>
  );
}