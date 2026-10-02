import { money } from "../../utils/formatting";
import { categoryIcon } from "../../utils/categories";

export default function CategorySpending({
  budgets = [],
  categorySpending = {},
}) {
  const safeBudgets = Array.isArray(budgets)
    ? budgets
    : [];

  const safeSpending =
    categorySpending &&
    typeof categorySpending === "object"
      ? categorySpending
      : {};

  const categories = Object.entries(
    safeSpending,
  )
    .map(([category, spent]) => ({
      category,
      spent: Number(spent) || 0,
      budget:
        Number(
          safeBudgets.find(
            (item) =>
              item.category === category,
          )?.amount,
        ) || 0,
    }))
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
          }) => {
            const percentage =
              budget > 0
                ? Math.min(
                    (spent / budget) * 100,
                    100,
                  )
                : 0;

            return (
              <div
                className="category-row"
                key={category}
              >
                <div className="category-icon">
                  {categoryIcon(category)}
                </div>

                <div className="category-info">
                  <strong>
                    {category}
                  </strong>

                  <div className="category-progress">
                    <div
                      className="category-progress-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="category-values">
                  <strong>
                    {money(spent)}
                  </strong>

                  {budget > 0 && (
                    <span>
                      of {money(budget)}
                    </span>
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