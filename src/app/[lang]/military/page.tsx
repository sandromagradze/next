import type { Metadata } from "next";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { categoryMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: SupportedLanguageCode }> }): Promise<Metadata> {
	const { lang } = await params;
	return categoryMetadata(lang, "military");
}

export default function MilitaryPage() {
	return null;
}
