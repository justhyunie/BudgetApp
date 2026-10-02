import { useMemo } from "react";
import { api } from "../utils/api";
import { formatDate, monthKey, money } from "../utils/formatting";
import { categoryIcon } from "../utils/categories";

export default function Transactions({
  transactions,
  selectedMonth,
  setSelectedMonth,
  setTransactions,
  categories,
  setTransactionError,
  transactionError,
  openTransactionModal,
  openCsvImportModal,
}) {
  const monthTransactions = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            monthKey(transaction.date) ===
            selectedMonth,
        )
        .sort(
          (a, b) =>
            new Date(b.date) - new Date(a.date),
        ),
    [transactions, selectedMonth],
  );

  async function deleteTransaction(id) {
    const confirmed = window.confirm(
      "Delete this transaction?",
    );

    if (!confirmed) return;

    try {
      await api(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      setTransactions((current) =>
        current.filter(
          (transaction) =>
            transaction.id !== id,
        ),
      );

      setTransactionError("");
    } catch (error) {
      setTransactionError(
        error.message ||
          "Failed to delete transaction.",
      );
    }
  }

  function changeMonth(offset) {
    const date = new Date(
      `${selectedMonth}-01T00:00:00`,
    );

    date.setMonth(date.getMonth() + offset);

    setSelectedMonth(
      date.toISOString().slice(0, 7),
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="section-kicker">
            Activity
          </div>

          <h1>Transactions</h1>

          <p>
            View and manage your financial activity.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="secondary-button"
            onClick={openCsvImportModal}
          >
            Import CSV
          </button>

          <button
            className="primary-button"
            onClick={openTransactionModal}
          >
            + Add Transaction
          </button>
        </div>
      </header>

      <div className="month-nav">
        <button onClick={() => changeMonth(-1)}>
          ‹
        </button>

        <strong>
          {new Date(
            `${selectedMonth}-01T00:00:00`,
          ).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </strong>

        <button onClick={() => changeMonth(1)}>
          ›
        </button>
      </div>

      {transactionError && (
        <div className="error-banner">
          {transactionError}
        </div>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Transactions</h2>

            <p>
              {monthTransactions.length} transaction
              {monthTransactions.length === 1
                ? ""
                : "s"} this month.
            </p>
          </div>
        </div>

        {monthTransactions.length === 0 ? (
          <div className="empty-state">
            No transactions recorded for this month.
          </div>
        ) : (
          <div className="transaction-list">
            {monthTransactions.map(
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
                    {formatDate(transaction.date)}
                  </span>

                  <strong
                    className={
                      transaction.type === "income"
                        ? "amount-positive"
                        : "amount-negative"
                    }
                  >
                    {transaction.type === "income"
                      ? "+"
                      : "-"}
                    {money(transaction.amount)}
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
        )}
      </section>
    </div>
  );
}