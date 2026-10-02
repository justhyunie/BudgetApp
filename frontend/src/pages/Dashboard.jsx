import { useMemo } from "react";

import {
  formatMonth,
  monthKey,
} from "../utils/formatting";

import PageHeader from "../components/ui/PageHeader";
import MonthNavigator from "../components/ui/MonthNavigator";

import BalanceHero from "../components/dashboard/BalanceHero";
import SummaryCards from "../components/dashboard/SummaryCards";
import CategorySpending from "../components/dashboard/CategorySpending";
import Transactions from "../components/dashboard/Transactions";

export default function Dashboard({
  transactions,
  budgets,
  selectedMonth,
  setSelectedMonth,
  setActivePage,
  openTransactionModal,
}) {
  const monthTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          monthKey(transaction.date) ===
          selectedMonth,
      ),
    [transactions, selectedMonth],
  );

  const income = useMemo(
    () =>
      monthTransactions
        .filter(
          (transaction) =>
            transaction.type === "income",
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount || 0),
          0,
        ),
    [monthTransactions],
  );

  const expenses = useMemo(
    () =>
      monthTransactions
        .filter(
          (transaction) =>
            transaction.type !== "income",
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount || 0),
          0,
        ),
    [monthTransactions],
  );

  const net = income - expenses;

  const budgetTotal = useMemo(
    () =>
      budgets.reduce(
        (total, budget) =>
          total +
          Number(budget.amount || 0),
        0,
      ),
    [budgets],
  );

  const categoryTotals = useMemo(() => {
    return monthTransactions
      .filter(
        (transaction) =>
          transaction.type !== "income",
      )
      .reduce((totals, transaction) => {
        const category =
          transaction.category || "Other";

        totals[category] =
          (totals[category] || 0) +
          Number(transaction.amount || 0);

        return totals;
      }, {});
  }, [monthTransactions]);

  return (
    <div className="page">
      <PageHeader
        kicker="Overview"
        title="Dashboard"
        description={`Your financial overview for ${formatMonth(
          selectedMonth,
        )}.`}
        action={
          <button
            className="primary-button"
            onClick={openTransactionModal}
          >
            + Add Transaction
          </button>
        }
      />

      <MonthNavigator
        value={selectedMonth}
        onChange={setSelectedMonth}
      />

      <BalanceHero
        net={net}
        income={income}
        expenses={expenses}
      />

      <SummaryCards
        income={income}
        expenses={expenses}
        budget={budgetTotal}
      />

      <div className="dashboard-grid">
        <CategorySpending
          categoryTotals={categoryTotals}
          budgetTotal={budgetTotal}
        />

        <Transactions
          transactions={monthTransactions}
        />
      </div>

      <div className="dashboard-actions">
        <button
          className="secondary-button"
          onClick={() =>
            setActivePage("transactions")
          }
        >
          View All Transactions
        </button>
      </div>
    </div>
  );
}