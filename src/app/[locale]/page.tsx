import { notFound } from "next/navigation";

import Header from "@/components/Header/Header";
import Navbar from "@/components/Navbar/Navbar";

const SUPPORTED_LOCALES = ["ka", "en"];

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function HomePage({
  params,
}: HomePageProps) {
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  return (
    <>
      <Header locale={locale} />

      <Navbar locale={locale} />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold">
          IPN Next.js
        </h1>

        <p className="mt-2">
          Language: {locale}
        </p>
      </main>
    </>
  );
}