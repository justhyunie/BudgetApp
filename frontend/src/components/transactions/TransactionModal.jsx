import { useState } from "react";
import { api } from "../../utils/api";
import { getInitialDate } from "../../utils/formatting";
import { categoryIcon } from "../../utils/categories";

export default function TransactionModal({
  categories,
  close,
  onSaved,
}) {
  const [date, setDate] =
    useState(getInitialDate());

  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState(
      categories[0] || "Other",
    );

  const [type, setType] =
    useState("expense");

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!description.trim()) {
      setError(
        "Please enter a description.",
      );
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError(
        "Please enter a valid amount.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const transaction =
        await api(
          "/api/transactions",
          {
            method: "POST",
            body: JSON.stringify({
              date,
              description:
                description.trim(),
              amount: Number(amount),
              category,
              type,
            }),
          },
        );

      onSaved(transaction);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to save transaction.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={close}
    >
      <div
        className="modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <div className="section-kicker">
              Activity
            </div>

            <h2>
              Add Transaction
            </h2>
          </div>

          <button
            className="modal-close"
            onClick={close}
            type="button"
          >
            ×
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={handleSubmit}
        >
          <label className="form-field">
            <span>Date</span>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
            />
          </label>

          <label className="form-field">
            <span>Description</span>

            <input
              type="text"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="What was this transaction?"
              autoFocus
            />
          </label>

          <div className="form-grid">
            <label className="form-field">
              <span>Amount</span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value,
                  )
                }
                placeholder="0.00"
              />
            </label>

            <label className="form-field">
              <span>Type</span>

              <select
                value={type}
                onChange={(event) =>
                  setType(
                    event.target.value,
                  )
                }
              >
                <option value="expense">
                  Expense
                </option>

                <option value="income">
                  Income
                </option>
              </select>
            </label>
          </div>

          <label className="form-field">
            <span>Category</span>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value,
                )
              }
            >
              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {categoryIcon(item)}{" "}
                    {item}
                  </option>
                ),
              )}
            </select>
          </label>

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
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}