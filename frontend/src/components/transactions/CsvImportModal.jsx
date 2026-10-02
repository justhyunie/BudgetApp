import { useState } from "react";

import { api } from "../../utils/api";

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const character = line[i];

    if (character === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());
  return values;
}

function parseCsvDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
}

function parseCsvAmount(value) {
  if (!value) return 0;

  const stringValue = String(value).trim();
  const isNegative = /^\(.*\)$/.test(stringValue);

  const cleaned = stringValue
    .replace(/[$,\s]/g, "")
    .replace(/[()]/g, "");

  const amount = Number(cleaned) || 0;

  return isNegative ? -amount : amount;
}

function parseTransactionsCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) =>
    header.toLowerCase().trim(),
  );

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
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

    type = type.toLowerCase().trim();

    if (!type) {
      type = amount >= 0 ? "income" : "expense";
    }

    return {
      date: parseCsvDate(date),
      description,
      amount: Math.abs(amount),
      category,
      type: type === "income" ? "income" : "expense",
    };
  });
}

export default function CsvImportModal({
  close,
  onImported,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  async function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");

    try {
      const text = await selectedFile.text();
      const rows = parseTransactionsCsv(text);

      setPreview(rows);
    } catch (error) {
      console.error(error);
      setError("Unable to read this CSV file.");
      setPreview([]);
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
        error.message ||
          "Failed to import transactions.",
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={close}
    >
      <div
        className="modal modal-large"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <div className="section-kicker">
              Transactions
            </div>
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
            <div className="section-kicker">
              CSV Format
            </div>

            <p>
              Your CSV should include a header row.
              The importer recognizes the following
              columns:
            </p>

            <div className="csv-instructions-list">
              <div>
                <strong>date</strong>
                <span>
                  Transaction date
                </span>
              </div>

              <div>
                <strong>description</strong>
                <span>
                  Transaction description, name,
                  memo, or payee
                </span>
              </div>

              <div>
                <strong>amount</strong>
                <span>
                  Transaction amount
                </span>
              </div>

              <div>
                <strong>category</strong>
                <span>
                  Spending category
                </span>
              </div>

              <div>
                <strong>type</strong>
                <span>
                  income or expense
                </span>
              </div>
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
              If <strong>type</strong> is omitted,
              positive amounts are treated as income
              and negative amounts are treated as
              expenses. Dollar signs, commas, and
              parentheses are supported.
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
                {preview.slice(0, 10).map(
                  (transaction, index) => (
                    <div
                      className="csv-preview-row"
                      key={index}
                    >
                      <span>
                        {transaction.date}
                      </span>

                      <strong>
                        {transaction.description}
                      </strong>

                      <span>
                        {transaction.category}
                      </span>

                      <span>
                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}
                        $
                        {Number(
                          transaction.amount,
                        ).toFixed(2)}
                      </span>
                    </div>
                  ),
                )}
              </div>

              {preview.length > 10 && (
                <p className="muted-text">
                  Showing the first 10
                  transactions.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

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
              disabled={
                importing ||
                preview.length === 0
              }
            >
              {importing
                ? "Importing..."
                : `Import ${
                    preview.length || ""
                  } Transactions`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}