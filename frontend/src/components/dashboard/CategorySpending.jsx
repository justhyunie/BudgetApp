import { categoryIcon } from "../../utils/categories";
import { money } from "../../utils/formatting";

export default function CategorySpending({
  categoryTotals,
  budgetTotal,
}) {
  const categories = Object.entries(categoryTotals);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="section-kicker">
            Spending
          </div>

          <h2>Category Spending</h2>

          <p>
            Where your money is going this month.
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          No spending recorded this month.
        </div>
      ) : (
        <div className="category-list">
          {categories.map(([category, amount]) => {
            const percentage =
              budgetTotal > 0
                ? Math.min(
                    100,
                    (amount / budgetTotal) * 100,
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

                <div className="category-main">
                  <div className="category-heading">
                    <strong>{category}</strong>

                    <span>
                      {money(amount)}
                    </span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}