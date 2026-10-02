import { useMemo } from "react";

import MonthNavigator from "../components/ui/MonthNavigator";
import BalanceHero from "../components/dashboard/BalanceHero";
import SummaryCards from "../components/dashboard/SummaryCards";
import CategorySpending from "../components/dashboard/CategorySpending";
import Transactions from "../components/dashboard/Transactions";

import {
  isIncome,
  isExpense,
  transactionAmount,
} from "../utils/transactions";

import { monthKey } from "../utils/formatting";

export default function Dashboard({
  transactions,
  budgets,
  selectedMonth,
  setSelectedMonth,
  setActivePage,
  openTransactionModal,
}) {
  const monthTransactions = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          monthKey(transaction.date) ===
          selectedMonth,
      )
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date),
      );
  }, [transactions, selectedMonth]);

  const income = useMemo(() => {
    return monthTransactions
      .filter(isIncome)
      .reduce(
        (sum, transaction) =>
          sum + transactionAmount(transaction),
        0,
      );
  }, [monthTransactions]);

  const expenses = useMemo(() => {
    return monthTransactions
      .filter(isExpense)
      .reduce(
        (sum, transaction) =>
          sum + transactionAmount(transaction),
        0,
      );
  }, [monthTransactions]);

  const net = income - expenses;

  const categorySpending = useMemo(() => {
    return monthTransactions
      .filter(isExpense)
      .reduce((totals, transaction) => {
        const category =
          transaction.category || "Other";

        totals[category] =
          (totals[category] || 0) +
          transactionAmount(transaction);

        return totals;
      }, {});
  }, [monthTransactions]);

  const budgetSpending = useMemo(() => {
    return budgets.map((budget) => {
      const spent =
        categorySpending[budget.category] || 0;

      const limit =
        Number(budget.amount) || 0;

      return {
        ...budget,
        spent,
        remaining: limit - spent,
        percentage:
          limit > 0
            ? Math.min(
                (spent / limit) * 100,
                100,
              )
            : 0,
      };
    });
  }, [budgets, categorySpending]);

  const recentTransactions =
    monthTransactions.slice(0, 6);

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <div className="section-kicker">
            Overview
          </div>

          <h1>Dashboard</h1>

          <p>
            Your financial picture for the
            selected month.
          </p>
        </div>

        <div className="page-header-actions">
          <MonthNavigator
            value={selectedMonth}
            onChange={setSelectedMonth}
          />

          <button
            className="primary-button"
            type="button"
            onClick={openTransactionModal}
          >
            + Add Transaction
          </button>
        </div>
      </header>

      <BalanceHero
        income={income}
        expenses={expenses}
        net={net}
      />

      <SummaryCards
        income={income}
        expenses={expenses}
        net={net}
      />

      <div className="dashboard-grid">
        <CategorySpending
          budgets={budgetSpending}
          categorySpending={categorySpending}
        />

        <Transactions
          transactions={recentTransactions}
          setActivePage={setActivePage}
        />
      </div>
    </div>
  );
}