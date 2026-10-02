import { useState } from "react";
import { api } from "../../utils/api";

export default function AddBudgetForm({
  onAdded,
}) {
  const [category, setCategory] =
    useState("");
  const [amount, setAmount] =
    useState("");
  const [error, setError] =
    useState("");
  const [saving, setSaving] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!category.trim()) {
      setError(
        "Please enter a category.",
      );
      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      setError(
        "Please enter a valid amount.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const budget = await api(
        "/api/budgets",
        {
          method: "POST",
          body: JSON.stringify({
            category:
              category.trim(),
            amount: Number(amount),
          }),
        },
      );

      onAdded(budget);

      setCategory("");
      setAmount("");
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to create budget.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="add-budget-form"
      onSubmit={handleSubmit}
    >
      <label className="form-field">
        <span>Category</span>

        <input
          type="text"
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value,
            )
          }
          placeholder="e.g. Groceries"
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
            setAmount(
              event.target.value,
            )
          }
          placeholder="0.00"
        />
      </label>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <button
        className="primary-button"
        type="submit"
        disabled={saving}
      >
        {saving
          ? "Adding..."
          : "Add Budget"}
      </button>
    </form>
  );
}