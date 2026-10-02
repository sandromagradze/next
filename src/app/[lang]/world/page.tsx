import type { Metadata } from "next";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { categoryMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: SupportedLanguageCode }> }): Promise<Metadata> {
	const { lang } = await params;
	return categoryMetadata(lang, "world");
}

export default function WorldPage() {
	return null;
}
