import type { Metadata } from "next";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { categoryMetadata } from "@/lib/seo";
import CategoryListingPage from "@/components/CategoryListing/CategoryListingPage";

export async function generateMetadata({ params }: { params: Promise<{ lang: SupportedLanguageCode }> }): Promise<Metadata> {
	const { lang } = await params;
	return categoryMetadata(lang, "world");
}

export default async function WorldPage({ params }: { params: Promise<{ lang: SupportedLanguageCode }> }) {
	const { lang } = await params;
	return <CategoryListingPage lang={lang} id={13} alias="world" />;
}
