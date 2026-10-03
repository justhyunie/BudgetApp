import { useEffect, useMemo, useState } from "react";

import "./App.css";

import { api } from "./utils/api";
import {
  getCategoriesFromBudgets,
  normalizeArray,
} from "./utils/categories";
import { getMonthDate } from "./utils/formatting";

import AppShell from "./components/layout/AppShell";
import LockScreen from "./components/layout/LockScreen";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Wealth from "./pages/Wealth";
import Settings from "./pages/Settings";

import TransactionModal from "./components/transactions/TransactionModal";
import CsvImportModal from "./components/transactions/CsvImportModal";
import BudgetModal from "./components/budget/BudgetModal";

const PIN = "3517";

export default function App() {
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem("budgetapp-unlocked") === "true",
  );

  const [pin, setPin] = useState("");

  const [activePage, setActivePage] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(getMonthDate());

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [wealthHistory, setWealthHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [transactionError, setTransactionError] = useState("");
  const [appError, setAppError] = useState("");

  const [modal, setModal] = useState(null);

  const categories = useMemo(
    () => getCategoriesFromBudgets(budgets),
    [budgets],
  );

  async function loadData() {
    setLoading(true);
    setAppError("");

    try {
      const [
        transactionsData,
        budgetsData,
        accountsData,
        wealthHistoryData,
      ] = await Promise.all([
        api("/api/transactions"),
        api("/api/budgets"),
        api("/api/accounts"),
        api("/api/wealth-history"),
      ]);

      setTransactions(normalizeArray(transactionsData));
      setBudgets(normalizeArray(budgetsData));
      setAccounts(normalizeArray(accountsData));
      setWealthHistory(normalizeArray(wealthHistoryData));
    } catch (error) {
      console.error(error);

      setAppError(
        error.message ||
        "Failed to load application data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (unlocked) {
      loadData();
    }
  }, [unlocked]);

  function unlock() {
    if (pin === PIN) {
      sessionStorage.setItem(
        "budgetapp-unlocked",
        "true",
      );

      setUnlocked(true);
      setPin("");
    }
  }

  function lock() {
    sessionStorage.removeItem(
      "budgetapp-unlocked",
    );

    setUnlocked(false);
    setPin("");
  }

  function openModal(type) {
    setModal({ type });
  }

  function closeModal() {
    setModal(null);
  }

  if (!unlocked) {
    return (
      <LockScreen
        pin={pin}
        setPin={setPin}
        unlock={unlock}
      />
    );
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="lock-logo">💰</div>
        <p>Loading Budget App...</p>
      </div>
    );
  }

  return (
    <AppShell
      activePage={activePage}
      setActivePage={setActivePage}
      lock={lock}
      appError={appError}
      retry={loadData}
    >
      {activePage === "dashboard" && (
        <Dashboard
          transactions={transactions}
          budgets={budgets}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          setActivePage={setActivePage}
          openTransactionModal={() =>
            openModal("transaction")
          }
        />
      )}

      {activePage === "transactions" && (
        <Transactions
          transactions={transactions}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          categories={categories}
          setTransactions={setTransactions}
          setTransactionError={setTransactionError}
          transactionError={transactionError}
          openTransactionModal={() =>
            openModal("transaction")
          }
          openCsvImportModal={() =>
            openModal("csv-import")
          }
        />
      )}

      {activePage === "budgets" && (
        <Budget
          budgets={budgets}
          setBudgets={setBudgets}
          categories={categories}
          openBudgetModal={() =>
            openModal("budget")
          }
        />
      )}

      {activePage === "wealth" && (
        <Wealth
          accounts={accounts}
          setAccounts={setAccounts}
          wealthHistory={wealthHistory}
          setWealthHistory={setWealthHistory}
          transactions={transactions}
        />
      )}


      {activePage === "settings" && (
        <Settings
          loadData={loadData}
          lock={lock}
        />
      )}

      {modal?.type === "transaction" && (
        <TransactionModal
          categories={categories}
          close={closeModal}
          onSaved={(transaction) => {
            setTransactions((current) => [
              transaction,
              ...current,
            ]);

            closeModal();
          }}
        />
      )}

      {modal?.type === "budget" && (
        <BudgetModal
          close={closeModal}
          onSaved={(budget) => {
            setBudgets((current) => [
              ...current,
              budget,
            ]);

            closeModal();
          }}
        />
      )}

      {modal?.type === "csv-import" && (
        <CsvImportModal
          close={closeModal}
          onImported={(importedTransactions) => {
            setTransactions((current) => [
              ...importedTransactions,
              ...current,
            ]);

            closeModal();
          }}
        />
      )}
    </AppShell>
  );
}