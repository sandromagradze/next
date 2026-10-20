import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryListingPage, {
  generateCategoryMetadata,
  parseCategorySlug,
} from "@/components/CategoryListing/CategoryListingPage";
import {
  isSupportedLanguageCode,
  type SupportedLanguageCode,
} from "@/lib/api/i18n";

interface CategoryPageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;

  if (!isSupportedLanguageCode(rawLang)) {
    notFound();
  }

  return generateCategoryMetadata(rawLang, slug);
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { lang: rawLang, slug } = await params;

  if (!isSupportedLanguageCode(rawLang)) {
    notFound();
  }

  const category = parseCategorySlug(slug);

  if (!category) {
    notFound();
  }

  const lang: SupportedLanguageCode = rawLang;

  return (
    <CategoryListingPage
      lang={lang}
      id={category.id}
      alias={category.alias}
    />
  );
}
