import { api } from "../../utils/api";
import { formatDate, money } from "../../utils/formatting";
import { categoryIcon } from "../../utils/categories";
import {
  getTransactionType,
  transactionAmount,
} from "../../utils/transactions";

export default function TransactionList({
  transactions,
  setTransactions,
  setError,
}) {
  async function deleteTransaction(id) {
    setError("");

    try {
      await api(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      setTransactions((current) =>
        current.filter(
          (transaction) =>
            Number(transaction.id) !== Number(id),
        ),
      );
    } catch (error) {
      console.error("Delete transaction failed:", error);

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
      {transactions.map((transaction) => {
        const type =
          getTransactionType(transaction);

        const amount =
          transactionAmount(transaction);

        const income = type === "income";

        return (
          <div
            className="transaction-row"
            key={transaction.id}
          >
            <div className="transaction-icon">
              {categoryIcon(transaction.category)}
            </div>

            <div className="transaction-info">
              <strong>
                {transaction.description}
              </strong>

              <span>
                {transaction.category || "Other"}
              </span>
            </div>

            <span className="transaction-date">
              {formatDate(transaction.date)}
            </span>

            <strong
              className={`transaction-amount ${
                income ? "income" : ""
              }`}
            >
              {income ? "+" : "-"}
              {money(amount)}
            </strong>

            <button
              className="delete-button"
              type="button"
              onClick={() =>
                {console.log("DELETE CLICKED:", transaction.id)

                deleteTransaction(transaction.id)
              }}
              title="Delete transaction"
              aria-label={`Delete ${transaction.description}`}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}