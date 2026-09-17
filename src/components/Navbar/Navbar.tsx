"use client";

import Link from "next/link";

interface NavbarProps {
  locale: string;
}

const NAV_ITEMS = [
  {
    label: "რეგიონი",
    path: "region",
  },
  {
    label: "სამხედრო",
    path: "military",
  },
  {
    label: "კულტურა",
    path: "culture",
  },
  {
    label: "პოლიტიკა",
    path: "politics",
  },
  {
    label: "ეკონომიკა",
    path: "economy",
  },
  {
    label: "საზოგადოება",
    path: "society",
  },
];

export default function Navbar({ locale }: NavbarProps) {
  return (
    <nav className="border-b border-gray-200">
      <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            href={`/${locale}/${item.path}`}
            className="whitespace-nowrap text-sm font-medium transition-colors hover:text-blue-600"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}