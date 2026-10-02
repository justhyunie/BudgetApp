import { money } from "../../utils/formatting";
import { categoryIcon } from "../../utils/categories";

export default function CategorySpending({
  budgets = [],
  categorySpending = {},
}) {
  const safeBudgets = Array.isArray(budgets) ? budgets : [];

  const safeSpending =
    categorySpending &&
      typeof categorySpending === "object"
      ? categorySpending
      : {};

  const categories = Object.entries(safeSpending)
    .map(([category, spent]) => {
      const budgetItem = safeBudgets.find(
        (item) => item.category === category,
      );

      const spentAmount = Number(spent) || 0;
      const budgetAmount = Number(budgetItem?.amount) || 0;
      const hasBudget = Boolean(budgetItem);

      const percentage = hasBudget
        ? budgetAmount > 0
          ? (spentAmount / budgetAmount) * 100
          : 0
        : null;

      return {
        category,
        spent: spentAmount,
        budget: budgetAmount,
        hasBudget,
        percentage,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  if (categories.length === 0) {
    return (
      <section className="panel category-spending">
        <div className="panel-header">
          <div>
            <div className="section-kicker">
              Spending
            </div>
            <h2>By Category</h2>
          </div>
        </div>

        <div className="empty-state">
          No spending recorded this month.
        </div>
      </section>
    );
  }

  return (
    <section className="panel category-spending">
      <div className="panel-header">
        <div>
          <div className="section-kicker">
            Spending
          </div>
          <h2>By Category</h2>
        </div>
      </div>

      <div className="category-list">
        {categories.map(
          ({
            category,
            spent,
            budget,
            hasBudget,
            percentage,
          }) => {
            const isOverBudget =
              hasBudget &&
              budget > 0 &&
              spent > budget;

            const progressWidth =
              hasBudget && budget > 0
                ? Math.min(percentage, 100)
                : 0;

            return (
              <div
                className={`category-row ${!hasBudget
                  ? "category-row-no-budget"
                  : ""
                  } ${isOverBudget
                    ? "category-row-over-budget"
                    : ""
                  }`}
                key={category}
              >
                <div className="category-icon">
                  {categoryIcon(category)}
                </div>

                <div className="category-info">
                  <strong>{category}</strong>

                  {hasBudget ? (
                    <div className="category-progress">
                      <div
                        className={`category-progress-fill ${isOverBudget
                          ? "over-budget"
                          : ""
                          }`}
                        style={{
                          width: `${progressWidth}%`,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="category-progress category-progress-unbudgeted">
                      <div className="category-progress-unbudgeted-line" />
                    </div>
                  )}
                </div>
                <div className="category-values">
                  {hasBudget ? (
                    <>
                      <strong> {Math.ceil(percentage)}% </strong>
                      <span> {money(spent)} / {money(budget)} </span>
                    </>
                  )
                    : (
                      <>
                        <strong className="category-no-budget-label">
                          No budget
                        </strong>

                        <span>
                          {money(spent)} spent
                        </span>
                      </>
                    )}
                </div>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}