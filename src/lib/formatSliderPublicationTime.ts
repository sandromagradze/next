import { parsePublicationDate } from "@/lib/api/publicationDate";

const TBILISI_TIME_ZONE = "Asia/Tbilisi";

const tbilisiDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TBILISI_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function getNaivePublicationTimestamp(
  value: string,
): number | null {
  const displayFormatMatch = value.match(
    /^(\d{2})\.(\d{2})\.(\d{4})(?:\s*\/\s*(\d{2}):(\d{2}))?$/,
  );

  if (displayFormatMatch) {
    const hour = Number(displayFormatMatch[4] ?? "0");
    const minute = Number(displayFormatMatch[5] ?? "0");
    const timestamp = parsePublicationDate(value);

    return hour <= 23 && minute <= 59
      ? timestamp
      : Number.NEGATIVE_INFINITY;
  }

  const isoMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/,
  );

  if (!isoMatch) {
    return null;
  }

  const [
    ,
    year,
    month,
    day,
    hour = "0",
    minute = "0",
    second = "0",
    fraction = "",
  ] = isoMatch;
  const parts = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
    millisecond: Number(fraction.padEnd(3, "0")),
  };

  if (
    parts.hour > 23 ||
    parts.minute > 59 ||
    parts.second > 59
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );
  const date = new Date(timestamp);

  return date.getUTCFullYear() === parts.year &&
    date.getUTCMonth() === parts.month - 1 &&
    date.getUTCDate() === parts.day
    ? timestamp
    : Number.NEGATIVE_INFINITY;
}

function getTbilisiOffset(timestamp: number): number {
  const parts = tbilisiDateTimeFormatter.formatToParts(
    new Date(timestamp),
  );
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  const timeInTbilisiAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return timeInTbilisiAsUtc - Math.floor(timestamp / 1000) * 1000;
}

function getPublicationTimestamp(value: string): number {
  const normalized = value.trim();
  const naiveTimestamp =
    getNaivePublicationTimestamp(normalized);

  if (naiveTimestamp !== null) {
    return Number.isFinite(naiveTimestamp)
      ? naiveTimestamp - getTbilisiOffset(naiveTimestamp)
      : naiveTimestamp;
  }

  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized)
    ? parsePublicationDate(normalized)
    : Number.NEGATIVE_INFINITY;
}

const sidebarDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TBILISI_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Formats a publication timestamp for sidebar article cards. */
export function formatPublicationDateTime(
  value: string | null | undefined,
  lang: "ka" | "en",
  now = Date.now(),
): string {
  const normalized = value?.trim();
  if (!normalized) return "";

  const timestamp = getPublicationTimestamp(normalized);
  if (!Number.isFinite(timestamp)) return "";

  const includesTime =
    /(?:T|\/\s*)\d{2}:\d{2}/.test(normalized);
  const elapsedMilliseconds = now - timestamp;

  if (
    includesTime &&
    elapsedMilliseconds >= 0 &&
    elapsedMilliseconds < 60 * 60 * 1000
  ) {
    const elapsedMinutes = Math.max(
      1,
      Math.round(elapsedMilliseconds / (60 * 1000)),
    );
    return lang === "en"
      ? `${elapsedMinutes} ${elapsedMinutes === 1 ? "minute" : "minutes"} ago`
      : `${elapsedMinutes} წუთის წინ`;
  }

  const date = new Date(timestamp);
  const parts = Object.fromEntries(
    sidebarDateTimeFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const datePart = `${parts.day}.${parts.month}.${parts.year}`;

  return includesTime
    ? `${datePart} / ${parts.hour}:${parts.minute}`
    : datePart;
}

export function formatSliderPublicationTime(
  absoluteTime: string,
  publicationTimestamp: string | null | undefined,
  now = Date.now(),
): string {
  if (!publicationTimestamp) {
    return absoluteTime;
  }

  const timestamp = getPublicationTimestamp(publicationTimestamp);

  if (!Number.isFinite(timestamp)) {
    return absoluteTime;
  }

  const elapsedMilliseconds = now - timestamp;

  if (
    elapsedMilliseconds < 0 ||
    elapsedMilliseconds >= 60 * 60 * 1000
  ) {
    return absoluteTime;
  }

  const elapsedMinutes = Math.max(
    1,
    Math.round(elapsedMilliseconds / (60 * 1000)),
  );

  return `${elapsedMinutes} წუთის წინ`;
}
