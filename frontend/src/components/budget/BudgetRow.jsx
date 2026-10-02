import { useState } from "react";
import { api } from "../../utils/api";
import { money } from "../../utils/formatting";

export default function BudgetRow({
  budget,
  onUpdated,
  onDeleted,
}) {
  const [amount, setAmount] = useState(
    budget.amount ?? "",
  );
  const [saving, setSaving] = useState(false);

  async function saveBudget() {
    setSaving(true);

    try {
      const updated = await api(
        `/api/budgets/${budget.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            amount: Number(amount),
          }),
        },
      );

      onUpdated(updated);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function deleteBudget() {
    if (
      !window.confirm(
        `Delete the ${budget.category} budget?`,
      )
    ) {
      return;
    }

    try {
      await api(
        `/api/budgets/${budget.id}`,
        {
          method: "DELETE",
        },
      );

      onDeleted(budget.id);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="budget-row">
      <div className="budget-info">
        <strong>{budget.category}</strong>

        <span>
          Monthly budget
        </span>
      </div>

      <div className="budget-input-wrap">
        <span>$</span>

        <input
          className="budget-input"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) =>
            setAmount(event.target.value)
          }
          onBlur={saveBudget}
          disabled={saving}
        />
      </div>

      <strong className="budget-amount">
        {money(budget.amount)}
      </strong>

      <button
        className="icon-button"
        type="button"
        onClick={deleteBudget}
        title="Delete budget"
      >
        ×
      </button>
    </div>
  );
}