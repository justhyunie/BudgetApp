import { categoryIcon } from "../../utils/categories";
import {
  formatDate,
  money,
} from "../../utils/formatting";

export default function Transactions({
  transactions,
}) {
  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date),
    )
    .slice(0, 5);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="section-kicker">
            Activity
          </div>

          <h2>Recent Transactions</h2>

          <p>
            Your latest financial activity.
          </p>
        </div>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="empty-state">
          No transactions yet.
        </div>
      ) : (
        <div className="transaction-list">
          {recentTransactions.map(
            (transaction) => (
              <div
                className="transaction-row"
                key={transaction.id}
              >
                <div className="transaction-icon">
                  {categoryIcon(
                    transaction.category,
                  )}
                </div>

                <div className="transaction-main">
                  <strong>
                    {transaction.description}
                  </strong>

                  <span>
                    {transaction.category ||
                      "Other"}
                  </span>
                </div>

                <span className="transaction-date">
                  {formatDate(
                    transaction.date,
                  )}
                </span>

                <strong
                  className={
                    transaction.type ===
                    "income"
                      ? "amount-positive"
                      : "amount-negative"
                  }
                >
                  {transaction.type ===
                  "income"
                    ? "+"
                    : "-"}
                  {money(
                    transaction.amount,
                  )}
                </strong>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}