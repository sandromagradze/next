"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import "./WeatherInfo.css";

interface CurrentDateTime {
  date: string;
  time: string;
}

interface WeatherInfoProps {
  lang: string;
}

function getCurrentDateTime(lang: string): CurrentDateTime {
  const now = new Date();

  const locale = lang === "en" ? "en-US" : "ka-GE";

  const dateParts = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
    timeZone: "Asia/Tbilisi",
  }).formatToParts(now);

  const getPart = (type: string) =>
    dateParts.find((part) => part.type === type)?.value ?? "";

  if (lang === "en") {
    const weekday = getPart("weekday").replace(".", "");
    const day = getPart("day");
    const month = getPart("month").replace(".", "");
    const year = getPart("year");

    const time = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Tbilisi",
    }).format(now);

    return {
      date: `${weekday}/${day}${month}/${year}`,
      time,
    };
  }

  const weekdayMap: Record<string, string> = {
    "კვი.": "კვი",
    "ორშ.": "ორშ",
    "სამ.": "სამ",
    "ოთხ.": "ოთხ",
    "ხუთ.": "ხუთ",
    "პარ.": "პარ",
    "შაბ.": "შაბ",
  };

  const monthMap: Record<string, string> = {
    "იან.": "იან",
    "თებ.": "თებ",
    "მარ.": "მარ",
    "აპრ.": "აპრ",
    "მაისი": "მაის",
    "ივნ.": "ივნ",
    "ივლ.": "ივლ",
    "აგვ.": "აგვ",
    "სექ.": "სექ",
    "ოქტ.": "ოქტ",
    "ნოე.": "ნოე",
    "დეკ.": "დეკ",
  };

  const weekday =
    weekdayMap[getPart("weekday")] ?? getPart("weekday");

  const day = getPart("day");

  const month =
    monthMap[getPart("month")] ?? getPart("month");

  const year = getPart("year");

  const time = new Intl.DateTimeFormat("ka-GE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tbilisi",
  }).format(now);

  return {
    date: `${weekday}/${day}${month}/${year}`,
    time,
  };
}

export default function WeatherInfo({
  lang,
}: WeatherInfoProps) {
  const [current, setCurrent] =
    useState<CurrentDateTime | null>(null);

  useEffect(() => {
    const updateDateTime = () => {
      setCurrent(getCurrentDateTime(lang));
    };

    updateDateTime();

    const interval = setInterval(
      updateDateTime,
      60 * 1000,
    );

    return () => clearInterval(interval);
  }, [lang]);

  return (
    <section
      className="weather-info"
      aria-label={lang === "en" ? "Weather" : "ამინდი"}
    >
      <div className="weather-info__datetime">
        <time className="weather-info__date">
          {current?.date ?? ""}
        </time>

        <time className="weather-info__time">
          {current?.time ?? ""}
        </time>
      </div>

      <Link
        href="https://amindi.ge/ka/"
        target="_blank"
        rel="noopener noreferrer"
        className="weather-info__link"
      >
        {lang === "en"
          ? "Weather/AMINDI.GE"
          : "ამინდი/AMINDI.GE"}
      </Link>
    </section>
  );
}