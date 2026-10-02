import { useMemo } from "react";

import PageHeader from "../components/ui/PageHeader";
import MonthNavigator from "../components/ui/MonthNavigator";
import TransactionList from "../components/transactions/TransactionList";

import { formatMonth, monthKey } from "../utils/formatting";

export default function Transactions({
  transactions,
  selectedMonth,
  setSelectedMonth,
  setTransactions,
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
            new Date(b.date) -
            new Date(a.date),
        ),
    [transactions, selectedMonth],
  );

  return (
    <div className="page transactions-page">
      <PageHeader
        kicker="Activity"
        title="Transactions"
        description={`Your financial activity for ${formatMonth(
          selectedMonth,
        )}.`}
        action={
          <div className="page-header-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={openCsvImportModal}
            >
              Import CSV
            </button>

            <button
              className="primary-button"
              type="button"
              onClick={openTransactionModal}
            >
              + Add Transaction
            </button>
          </div>
        }
      />

      <MonthNavigator
        value={selectedMonth}
        onChange={setSelectedMonth}
      />

      <section className="panel transactions-panel">
        <div className="panel-header">
          <div>
            <div className="section-kicker">
              Monthly Activity
            </div>

            <h2>
              {monthTransactions.length}{" "}
              {monthTransactions.length === 1
                ? "Transaction"
                : "Transactions"}
            </h2>

            <p>
              Income and expenses recorded for this
              month.
            </p>
          </div>
        </div>

        {transactionError && (
          <div className="transactions-error">
            {transactionError}
          </div>
        )}

        <TransactionList
          transactions={monthTransactions}
          setTransactions={setTransactions}
          setError={setTransactionError}
        />
      </section>
    </div>
  );
}