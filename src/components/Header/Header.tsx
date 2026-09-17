"use client";

import Link from "next/link";
import LanguageChange from "@/components/LanguageChange/LanguageChange";
import CurrencyTransfer from "@/components/CurrencyTransfer/CurrencyTransfer";

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link
          href={`/${locale}`}
          className="text-2xl font-bold"
        >
          IPN
        </Link>

        <div className="flex items-center gap-6">
          <CurrencyTransfer locale={locale} />

          <LanguageChange locale={locale} />
        </div>
      </div>
    </header>
  );
}