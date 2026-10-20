import type { Metadata } from "next";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import CategoryListingPage, {
  generateCategoryMetadata,
} from "@/components/CategoryListing/CategoryListingPage";

interface PageProps {
  params: Promise<{ lang: SupportedLanguageCode }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const id = lang === "ka" ? 44 : 43;
  const alias = lang === "ka" ? "interviu" : "interview";
  return generateCategoryMetadata(lang, `${id}-${alias}`, "interview");
}

export default async function InterviewPage({ params }: PageProps) {
  const { lang } = await params;
  const id = lang === "ka" ? 44 : 43;
  const alias = lang === "ka" ? "interviu" : "interview";
  return <CategoryListingPage lang={lang} id={id} alias={alias} />;
}
