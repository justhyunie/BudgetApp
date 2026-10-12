
import { useState } from "react";

import { api } from "../../utils/api";

function parseCsvRecords(text) {
  const records = [];
  let record = [];
  let field = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const character = text[i];

    if (character === '"') {
      if (insideQuotes && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === "," && !insideQuotes) {
      record.push(field);
      field = "";
    } else if (
      (character === "\n" || character === "\r") &&
      !insideQuotes
    ) {
      if (character === "\r" && text[i + 1] === "\n") {
        i += 1;
      }

      record.push(field);

      if (record.some((value) => value.trim() !== "")) {
        records.push(record);
      }

      record = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (insideQuotes) {
    throw new Error("CSV contains an unclosed quoted field.");
  }

  if (field !== "" || record.length > 0) {
    record.push(field);

    if (record.some((value) => value.trim() !== "")) {
      records.push(record);
    }
  }

  return records;
}

function parseCsvDate(value) {
  if (!value) return "";

  const trimmed = value.trim();

  const usDate = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
  );

  if (usDate) {
    const [, month, day, year] = usDate;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const isoDate = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (isoDate) return trimmed;

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid transaction date: ${value}`);
  }

  return date.toISOString().slice(0, 10);
}

function parseCsvAmount(value) {
  if (value == null || String(value).trim() === "") {
    throw new Error("Transaction is missing an amount.");
  }

  const stringValue = String(value).trim();
  const isParenthesized =
    stringValue.startsWith("(") &&
    stringValue.endsWith(")");

  const isNegative =
    stringValue.startsWith("-") || isParenthesized;

  const cleaned = stringValue
    .replace(/[$,\s()]/g, "")
    .replace(/^-/, "");

  const amount = Number(cleaned);

  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid transaction amount: ${value}`);
  }

  return isNegative ? -amount : amount;
}

function parseTransactionsCsv(text) {
  const records = parseCsvRecords(text);

  if (records.length < 2) {
    return [];
  }

  const headers = records[0].map((header, index) =>
    header
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase(),
  );

  const findColumn = (...names) =>
    names
      .map((name) => headers.indexOf(name))
      .find((index) => index !== -1);

  const dateIndex = findColumn(
    "date",
    "transaction_date",
    "posted",
  );

  const descriptionIndex = findColumn(
    "description",
    "name",
    "memo",
    "payee",
  );

  const amountIndex = findColumn(
    "amount",
    "transaction_amount",
    "value",
  );

  const categoryIndex = findColumn(
    "category",
    "categories",
  );

  const typeIndex = findColumn(
    "type",
    "transaction_type",
  );

  if (
    dateIndex === undefined ||
    descriptionIndex === undefined ||
    amountIndex === undefined
  ) {
    throw new Error(
      "CSV must include date, description, and amount columns.",
    );
  }

  return records.slice(1).map((values, index) => {
    const rowNumber = index + 2;

    try {
      const date = parseCsvDate(values[dateIndex] || "");
      const description = (
        values[descriptionIndex] || ""
      ).trim();

      const signedAmount = parseCsvAmount(
        values[amountIndex],
      );

      const category =
        categoryIndex === undefined
          ? "Other"
          : (values[categoryIndex] || "").trim() || "Other";

      let type =
        typeIndex === undefined
          ? ""
          : (values[typeIndex] || "").trim().toLowerCase();

      if (!type) {
        type = signedAmount >= 0 ? "income" : "expense";
      }

      if (!["income", "expense"].includes(type)) {
        throw new Error(`Invalid transaction type: ${type}`);
      }

      if (!date || !description) {
        throw new Error(
          "Transaction is missing a date or description.",
        );
      }

      return {
        date,
        description,
        amount: Math.abs(signedAmount),
        category,
        type,
      };
    } catch (error) {
      throw new Error(
        `CSV row ${rowNumber}: ${error.message}`,
      );
    }
  });
}

export default function CsvImportModal({ close, onImported }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  async function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setPreview([]);

    try {
      const text = await selectedFile.text();
      const rows = parseTransactionsCsv(text);

      setPreview(rows);

      if (rows.length === 0) {
        setError("No transactions were found in this CSV.");
      }
    } catch (error) {
      console.error(error);
      setError(error.message || "Unable to read this CSV file.");
    }
  }

  async function handleImport() {
    if (!preview.length) {
      setError("There are no transactions to import.");
      return;
    }

    setImporting(true);
    setError("");

    try {
      const imported = [];

      for (const transaction of preview) {
        const saved = await api("/api/transactions", {
          method: "POST",
          body: JSON.stringify(transaction),
        });

        imported.push(saved);
      }

      onImported(imported);
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Failed to import transactions.",
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div
        className="modal modal-large"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="section-kicker">Transactions</div>
            <h2>Import CSV</h2>
          </div>

          <button
            className="modal-close"
            onClick={close}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="modal-form">
          <label className="form-field">
            <span>CSV File</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
            />
          </label>

          <div className="csv-instructions">
            <div className="section-kicker">CSV Format</div>

            <p>
              Your CSV should include a header row. The importer
              recognizes these columns:
            </p>

            <div className="csv-instructions-list">
              <div><strong>date</strong><span>Transaction date</span></div>
              <div><strong>description</strong><span>Description, name, memo, or payee</span></div>
              <div><strong>amount</strong><span>Transaction amount</span></div>
              <div><strong>category</strong><span>Spending category</span></div>
              <div><strong>type</strong><span>income or expense</span></div>
            </div>

            <div className="csv-example">
              <strong>Example:</strong>
              <code>
                date,description,amount,category,type
                <br />
                2026-10-01,Paycheck,2064.00,Income,income
                <br />
                2026-10-01,Rent,1150.00,Housing,expense
              </code>
            </div>

            <p className="muted-text">
              Quoted descriptions may contain commas or line breaks.
              Dollar signs, thousands separators, negative amounts,
              and parentheses are supported.
            </p>
          </div>

          {file && (
            <div className="muted-text">
              Selected file: {file.name}
            </div>
          )}

          {preview.length > 0 && (
            <div className="csv-preview">
              <div className="csv-preview-header">
                <strong>Preview</strong>
                <span>
                  {preview.length} transaction
                  {preview.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="csv-preview-list">
                {preview.slice(0, 10).map((transaction, index) => (
                  <div className="csv-preview-row" key={index}>
                    <span>{transaction.date}</span>
                    <strong>{transaction.description}</strong>
                    <span>{transaction.category}</span>
                    <span>
                      {transaction.type === "income" ? "+" : "-"}
                      ${Number(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {preview.length > 10 && (
                <p className="muted-text">
                  Showing the first 10 transactions.
                </p>
              )}
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={close}
              disabled={importing}
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={handleImport}
              disabled={importing || preview.length === 0}
            >
              {importing
                ? "Importing..."
                : `Import ${preview.length || ""} Transactions`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
