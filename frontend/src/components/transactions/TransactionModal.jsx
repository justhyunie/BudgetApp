import { useState } from "react";

import Modal from "../ui/Modal";
import FormField from "../ui/FormField";

import { api } from "../../utils/api";
import { getInitialDate } from "../../utils/formatting";
import { DEFAULT_CATEGORIES } from "../../utils/categories";

export default function TransactionModal({
  categories = DEFAULT_CATEGORIES,
  close,
  onSaved,
}) {
  const [date, setDate] = useState(getInitialDate());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState(
    categories[0] || "Other",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleTypeChange(event) {
    const nextType = event.target.value;

    setType(nextType);

    if (nextType === "income") {
      setCategory("Income");
    } else if (category === "Income") {
      setCategory(
        categories.find((item) => item !== "Income") || "Other",
      );
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const numericAmount = Math.abs(Number(amount));

    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const transaction = await api("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          date,
          description: description.trim(),
          amount: numericAmount,
          category,
          type: type === "income" ? "income" : "expense",
        }),
      });

      onSaved({
        ...transaction,
        amount: numericAmount,
        type,
        category,
      });
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to create transaction.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Add Transaction"
      kicker="Activity"
      close={close}
    >
      <form
        className="modal-body modal-form"
        onSubmit={handleSubmit}
      >
        <div className="form-grid">
          <FormField label="Date">
            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
            />
          </FormField>

          <FormField label="Type">
            <select
              value={type}
              onChange={handleTypeChange}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </FormField>
        </div>

        <FormField label="Description">
          <input
            type="text"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder={
              type === "income"
                ? "e.g. Paycheck"
                : "e.g. Groceries"
            }
          />
        </FormField>

        <div className="form-grid">
          <FormField label="Amount">
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
          </FormField>

          <FormField label="Category">
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              disabled={type === "income"}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>
        </div>

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
            {saving ? "Saving..." : "Add Transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}