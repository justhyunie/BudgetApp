import { api } from "../../utils/api";
import {
  formatDate,
  money,
} from "../../utils/formatting";
import { categoryIcon } from "../../utils/categories";

export default function TransactionList({
  transactions,
  setTransactions,
  setError,
}) {
  async function deleteTransaction(id) {
    if (
      !window.confirm(
        "Delete this transaction?",
      )
    ) {
      return;
    }

    try {
      await api(
        `/api/transactions/${id}`,
        {
          method: "DELETE",
        },
      );

      setTransactions((current) =>
        current.filter(
          (transaction) =>
            transaction.id !== id,
        ),
      );

      setError("");
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to delete transaction.",
      );
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map(
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

            <button
              className="icon-button"
              onClick={() =>
                deleteTransaction(
                  transaction.id,
                )
              }
              title="Delete transaction"
            >
              ×
            </button>
          </div>
        ),
      )}
    </div>
  );
}