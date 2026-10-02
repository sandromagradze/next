import type { Metadata } from "next";
import { createElement } from "react";

import type { SupportedLanguageCode } from "@/lib/api/i18n";

export const SITE_URL = "https://dev.ipn.ge";
export const SITE_NAME = "InterPressNews";

export const LANGUAGE_LABELS: Record<SupportedLanguageCode, string> = {
  ka: "ქართული",
  en: "English",
};

export const HOME_SEO: Record<
  SupportedLanguageCode,
  { title: string; description: string }
> = {
  ka: {
    title: "უახლესი ამბები საქართველოში და მსოფლიოში",
    description:
      "ინტერპრესნიუსი გთავაზობთ უახლეს ქართულ და საერთაშორისო ამბებს, პოლიტიკას, ეკონომიკას, საზოგადოებას, რეგიონებსა და სპორტს.",
  },
  en: {
    title: "Latest News from Georgia and Around the World",
    description:
      "InterPressNews delivers the latest news from Georgia and around the world, including politics, business, society, regions and sport.",
  },
};

export const CATEGORY_SEO: Record<
  string,
  Record<SupportedLanguageCode, { title: string; description: string }>
> = {
  politics: {
    ka: { title: "პოლიტიკა", description: "უახლესი პოლიტიკური ამბები საქართველოში და მსოფლიოში." },
    en: { title: "Politics", description: "The latest political news from Georgia and around the world." },
  },
  economy: {
    ka: { title: "ეკონომიკა", description: "ეკონომიკისა და ბიზნესის უახლესი ამბები." },
    en: { title: "Economy", description: "The latest economy and business news." },
  },
  region: {
    ka: { title: "რეგიონი", description: "უახლესი ამბები საქართველოს რეგიონებიდან." },
    en: { title: "Regions", description: "The latest news from Georgia's regions." },
  },
  military: {
    ka: { title: "სამხედრო", description: "სამხედრო და თავდაცვის სფეროს უახლესი ამბები." },
    en: { title: "Military", description: "The latest military and defence news." },
  },
  culture: {
    ka: { title: "კულტურა", description: "კულტურის, ხელოვნებისა და შემოქმედების უახლესი ამბები." },
    en: { title: "Culture", description: "The latest culture, arts and entertainment news." },
  },
  society: {
    ka: { title: "საზოგადოება", description: "საზოგადოებრივი ცხოვრების უახლესი ამბები." },
    en: { title: "Society", description: "The latest news about society and public life." },
  },
  law: {
    ka: { title: "სამართალი", description: "სამართლისა და მართლმსაჯულების უახლესი ამბები." },
    en: { title: "Justice", description: "The latest law and justice news." },
  },
  world: {
    ka: { title: "მსოფლიო", description: "უახლესი საერთაშორისო ამბები მსოფლიოს ქვეყნებიდან." },
    en: { title: "World", description: "The latest international news from around the world." },
  },
  sport: {
    ka: { title: "სპორტი", description: "სპორტის უახლესი ამბები და შედეგები." },
    en: { title: "Sport", description: "The latest sports news and results." },
  },
};

export function absoluteUrl(path: string): string {
  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL).toString();
}

export function localizedPath(
  lang: SupportedLanguageCode,
  path = "",
): string {
  return `/${lang}${path ? `/${path.replace(/^\/+/, "")}` : ""}`;
}

export function localizedAlternates(
  lang: SupportedLanguageCode,
  path = "",
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: absoluteUrl(localizedPath(lang, path)),
    languages: {
      ka: absoluteUrl(localizedPath("ka", path)),
      en: absoluteUrl(localizedPath("en", path)),
      "x-default": absoluteUrl(localizedPath("ka", path)),
    },
  };
}

export function localizedMetadata(
  lang: SupportedLanguageCode,
  path: string,
  title: string,
  description: string,
  options: Pick<Metadata, "robots" | "openGraph"> = {},
): Metadata {
  const url = absoluteUrl(localizedPath(lang, path));
  const { openGraph, ...otherOptions } = options;

  return {
    ...otherOptions,
    title,
    description,
    alternates: localizedAlternates(lang, path),
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: lang === "ka" ? "ka_GE" : "en_US",
      alternateLocale: lang === "ka" ? ["en_US"] : ["ka_GE"],
      ...openGraph,
    },
  };
}

export function categoryMetadata(
  lang: SupportedLanguageCode,
  slug: string,
): Metadata {
  const seo = CATEGORY_SEO[slug][lang];

  return localizedMetadata(
    lang,
    slug,
    seo.title,
    seo.description,
    { robots: { index: false, follow: true } },
  );
}

export function stripHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");

  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: serialized },
  });
}