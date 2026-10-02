import { api } from "../utils/api";
import { money } from "../utils/formatting";
import { categoryIcon } from "../utils/categories";

export default function Budget({
  budgets,
  setBudgets,
  categories,
  openBudgetModal,
}) {
  async function updateBudget(id, amount) {
    try {
      const updated = await api(`/api/budgets/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          amount: Number(amount),
        }),
      });

      setBudgets((current) =>
        current.map((budget) =>
          budget.id === id ? updated : budget,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteBudget(id) {
    if (!window.confirm("Delete this budget?")) {
      return;
    }

    try {
      await api(`/api/budgets/${id}`, {
        method: "DELETE",
      });

      setBudgets((current) =>
        current.filter(
          (budget) => budget.id !== id,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="section-kicker">
            Planning
          </div>

          <h1>Budgets</h1>

          <p>
            Set spending limits for your categories.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openBudgetModal}
        >
          + Add Budget
        </button>
      </header>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Monthly Budgets</h2>

            <p>
              Your current spending targets.
            </p>
          </div>
        </div>

        {budgets.length === 0 ? (
          <div className="empty-state">
            No budgets created yet.
          </div>
        ) : (
          <div className="budget-list">
            {budgets.map((budget) => (
              <div
                className="budget-row"
                key={budget.id}
              >
                <div className="category-icon">
                  {categoryIcon(budget.category)}
                </div>

                <div className="budget-main">
                  <strong>{budget.category}</strong>

                  <span>
                    Monthly spending limit
                  </span>
                </div>

                <input
                  className="budget-input"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={budget.amount}
                  onBlur={(event) =>
                    updateBudget(
                      budget.id,
                      event.target.value,
                    )
                  }
                />

                <span className="budget-value">
                  {money(budget.amount)}
                </span>

                <button
                  className="icon-button"
                  onClick={() =>
                    deleteBudget(budget.id)
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Available Categories</h2>

            <p>
              Categories can be used when creating
              budgets and transactions.
            </p>
          </div>
        </div>

        <div className="category-chip-list">
          {categories.map((category) => (
            <span
              className="category-chip"
              key={category}
            >
              {categoryIcon(category)}
              {category}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}