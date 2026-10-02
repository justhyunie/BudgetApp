import { useState } from "react";
import { api } from "../../utils/api";

export default function BudgetModal({
  close,
  onSaved,
}) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!category.trim()) {
      setError("Please enter a category.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const budget = await api("/api/budgets", {
        method: "POST",
        body: JSON.stringify({
          category: category.trim(),
          amount: Number(amount),
        }),
      });

      onSaved(budget);
    } catch (error) {
      setError(
        error.message ||
          "Failed to create budget.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div
        className="modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <div className="section-kicker">
              Planning
            </div>

            <h2>Add Budget</h2>
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
            <span>Category</span>

            <input
              type="text"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              placeholder="e.g. Groceries"
              autoFocus
            />
          </label>

          <label className="form-field">
            <span>Monthly Amount</span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="0.00"
            />
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
              {saving ? "Saving..." : "Add Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}