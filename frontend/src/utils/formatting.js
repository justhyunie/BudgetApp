export function money(value) {
  return Number(value || 0).toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  );
}

export function shortMoney(value) {
  const number = Number(value || 0);

  if (Math.abs(number) >= 1000000) {
    return `$${(number / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(number) >= 1000) {
    return `$${(number / 1000).toFixed(1)}k`;
  }

  return money(number);
}

export function formatDate(date) {
  if (!date) return "";

  const raw = String(date);

  const value =
    raw.length <= 10
      ? new Date(`${raw}T00:00:00`)
      : new Date(raw);

  if (Number.isNaN(value.getTime())) {
    return raw;
  }

  return value.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

export function formatMonth(date) {
  const value = new Date(
    `${date}-01T00:00:00`,
  );

  return value.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );
}

export function monthKey(date) {
  if (!date) return "";

  return String(date).slice(0, 7);
}

export function getInitialDate() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export function getMonthDate() {
  return new Date()
    .toISOString()
    .slice(0, 7);
}