export function parseCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const character = line[i];

    if (character === '"') {
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (
      character === "," &&
      !insideQuotes
    ) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());

  return values;
}

export function parseCsvDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
}

export function parseCsvAmount(value) {
  if (!value) return 0;

  const cleaned = String(value)
    .replace(/[$,\s]/g, "")
    .replace(/^\((.*)\)$/, "-$1");

  return Number(cleaned) || 0;
}

export function parseTransactionsCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(
    lines[0],
  ).map((header) =>
    header.toLowerCase().trim(),
  );

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] =
        values[index] || "";
    });

    const description =
      row.description ||
      row.name ||
      row.memo ||
      row.payee ||
      "";

    const date =
      row.date ||
      row.transaction_date ||
      row.posted ||
      "";

    const amount = parseCsvAmount(
      row.amount ||
        row.transaction_amount ||
        row.value,
    );

    const category =
      row.category ||
      row.categories ||
      "Other";

    let type =
      row.type ||
      row.transaction_type ||
      "";

    type = type.toLowerCase();

    if (!type) {
      type =
        amount >= 0
          ? "income"
          : "expense";
    }

    return {
      date: parseCsvDate(date),
      description,
      amount: Math.abs(amount),
      category,
      type:
        type === "income"
          ? "income"
          : "expense",
    };
  });
}