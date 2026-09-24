"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useRates from "@/components/hooks/useRates";

import "./CurrencyTransfer.css";

interface CurrencyRow {
  code: string;
  previousRate: string;
  currentRate: string;
}

interface CurrencyTransferComponentProps {
  lang: string;
}

interface CurrencyDates {
  previous: string;
  current: string;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ka-GE", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Tbilisi",
  }).format(date);
}

function getCurrencyDates(): CurrencyDates {
  const now = new Date();

  const currentDate = new Date(now);

  const previousDate = new Date(now);

  previousDate.setDate(
    previousDate.getDate() - 1,
  );

  return {
    previous: formatDate(previousDate),
    current: formatDate(currentDate),
  };
}

function getCurrencyAmount(code: string): string {
  return code.toUpperCase() === "RUB"
    ? "100"
    : "1";
}

export default function CurrencyTransfer({
  lang,
}: CurrencyTransferComponentProps) {
  const {
    data,
    isLoading,
    isError,
  } = useRates(lang);

  const [dates, setDates] =
    useState<CurrencyDates | null>(null);

  useEffect(() => {
    setDates(getCurrencyDates());
  }, []);

  const currencies: CurrencyRow[] =
    (data?.dataset || []).map((currency) => ({
      code: currency.label,
      previousRate: currency.data[0],
      currentRate: currency.data[1],
    }));

  return (
    <div className="curenncy">
      <div className="curenncy__dates">
        <Link href="https://bpn.ge" target="_blank" rel="noopener noreferrer"
          className="curenncy__brand">
          bpn.ge
        </Link>

        <div className="curenncy__date">
          {dates?.previous || ""}
        </div>

        <div className="curenncy__date">
          {dates?.current || ""}
        </div>
      </div>

      <div className="curenncy__list">
        {isLoading && (
          <div className="curenncy__status">
            Loading...
          </div>
        )}

        {isError && (
          <div className="curenncy__status curenncy__status--error">
            Failed to load rates
          </div>
        )}

        {!isLoading &&
          !isError &&
          currencies.map((currency) => {
            const amount = getCurrencyAmount(
              currency.code,
            );

            return (
              <div
                key={currency.code}
                className="curenncy__row"
              >
                <span className="curenncy__code">
                  {amount} {currency.code}
                </span>

                <span className="curenncy__rate">
                  {currency.previousRate}
                </span>

                <span className="curenncy__rate">
                  {currency.currentRate}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}