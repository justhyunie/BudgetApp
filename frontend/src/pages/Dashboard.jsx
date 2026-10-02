
import { useMemo } from "react";

import MonthNavigator from "../components/ui/MonthNavigator";
import BalanceHero from "../components/dashboard/BalanceHero";
import SummaryCards from "../components/dashboard/SummaryCards";
import CategorySpending from "../components/dashboard/CategorySpending";
import Transactions from "../components/dashboard/Transactions";

export default function Dashboard({ transactions = [], budgets = [], selectedMonth, setSelectedMonth, setActivePage, openTransactionModal, }) { console.log("🔥 NEW DASHBOARD FILE IS RUNNING"); console.log("SELECTED MONTH:", selectedMonth); console.log("ALL TRANSACTIONS:", transactions); const monthTransactions = useMemo(() => { return transactions.filter((transaction) => { const date = String(transaction.date || ""); return date.substring(0, 7) === selectedMonth; }); }, [transactions, selectedMonth]); console.log( "MONTH TRANSACTIONS:", monthTransactions, ); const income = monthTransactions.reduce( (total, transaction) => { const type = String( transaction.type || "", ) .trim() .toLowerCase(); const amount = Math.abs(Number(transaction.amount)) || 0; console.log( "TRANSACTION:", transaction.description, "TYPE:", type, "AMOUNT:", amount, ); if (type === "income") { return total + amount; } return total; }, 0, ); const expenses = monthTransactions.reduce( (total, transaction) => { const type = String( transaction.type || "", ) .trim() .toLowerCase(); const amount = Math.abs(Number(transaction.amount)) || 0; if (type === "expense") { return total + amount; } return total; }, 0, ); const net = income - expenses; console.log("CALCULATED INCOME:", income); console.log("CALCULATED EXPENSES:", expenses); console.log("CALCULATED NET:", net);
  /*
   * Spending by category
   */
  const categorySpending =
    monthTransactions.reduce(
      (totals, transaction) => {
        const type = String(
          transaction.type || "",
        )
          .trim()
          .toLowerCase();

        if (type !== "expense") {
          return totals;
        }

        const category =
          transaction.category || "Other";

        const amount =
          Math.abs(Number(transaction.amount)) || 0;

        totals[category] =
          (totals[category] || 0) + amount;

        return totals;
      },
      {},
    );

  /*
   * Budget information
   */
  const budgetSpending = budgets.map((budget) => {
    const limit =
      Number(budget.amount) || 0;

    const spent =
      categorySpending[budget.category] || 0;

    return {
      ...budget,
      amount: limit,
      spent,
      remaining: limit - spent,
      percentage:
        limit > 0
          ? (spent / limit) * 100
          : 0,
    };
  });

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

