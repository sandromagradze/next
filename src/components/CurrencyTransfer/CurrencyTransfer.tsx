"use client";

interface CurrencyTransferProps {
  locale: string;
}

export default function CurrencyTransfer({
  locale,
}: CurrencyTransferProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span>EUR</span>
      <span>RUB</span>
      <span>USD</span>
    </div>
  );
}