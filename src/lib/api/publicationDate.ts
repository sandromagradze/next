export function parsePublicationDate(
  value?: string | null,
): number {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const normalized = value.trim();

  if (!normalized) {
    return Number.NEGATIVE_INFINITY;
  }

  const match = normalized.match(
    /^(\d{2})\.(\d{2})\.(\d{4})(?:\s*\/\s*(\d{2}):(\d{2}))?$/,
  );

  if (match) {
    const [, day, month, year, hour = "0", minute = "0"] = match;
    const timestamp = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );
    const date = new Date(timestamp);

    if (
      date.getUTCFullYear() !== Number(year) ||
      date.getUTCMonth() !== Number(month) - 1 ||
      date.getUTCDate() !== Number(day)
    ) {
      return Number.NEGATIVE_INFINITY;
    }

    return timestamp;
  }

  const parsed = Date.parse(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : Number.NEGATIVE_INFINITY;
}

export function sortByPublicationDate<T>(
  items: readonly T[],
  getDate: (item: T) => string | null | undefined,
): T[] {
  return [...items].sort(
    (first, second) =>
      parsePublicationDate(getDate(second)) -
      parsePublicationDate(getDate(first)),
  );
}