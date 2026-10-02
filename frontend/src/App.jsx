
import { useEffect, useMemo, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import "./App.css";

const PIN = "3517";

const DEFAULT_CATEGORIES = [
  "Housing",
  "Food",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Subscriptions",
  "Debt",
  "Other"
];

const CATEGORY_ICONS = {
  Housing: "🏠",
  Food: "🍴",
  Transportation: "🚗",
  Utilities: "💡",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Health: "❤️",
  Subscriptions: "📱",
  Debt: "💳",
  Other: "📦",
  Income: "💰"
};

function money(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function shortMoney(value) {
  const number = Number(value || 0);

  if (Math.abs(number) >= 1000000) {
    return `$${(number / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(number) >= 1000) {
    return `$${(number / 1000).toFixed(1)}k`;
  }

  return money(number);
}

function formatDate(date) {
  if (!date) return "";

  const value = new Date(`${date}T00:00:00`);

  if (Number.isNaN(value.getTime())) return date;

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatMonth(date) {
  const value = new Date(`${date}-01T00:00:00`);

  return value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
}

function monthKey(date) {
  if (!date) return "";

  return String(date).slice(0, 7);
}

function getInitialDate() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthDate() {
  return new Date().toISOString().slice(0, 7);
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getCategoriesFromBudgets(budgets) {
  const categories = normalizeArray(budgets)
    .map((budget) => budget.category)
    .filter(Boolean);

  return [...new Set([...DEFAULT_CATEGORIES, ...categories])];
}

function categoryIcon(category) {
  return CATEGORY_ICONS[category] || "📦";
}

/* -------------------------------------------------------
   API
------------------------------------------------------- */

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

/* -------------------------------------------------------
   CSV IMPORT HELPERS
------------------------------------------------------- */

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value.trim());
  return values;
}

function parseCsvDate(value) {
  const trimmed = String(value || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(`${trimmed}T00:00:00`);

    if (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === Number(trimmed.slice(0, 4)) &&
      date.getMonth() + 1 === Number(trimmed.slice(5, 7)) &&
      date.getDate() === Number(trimmed.slice(8, 10))
    ) {
      return trimmed;
    }

    return "";
  }

  const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (!match) {
    return "";
  }

  const [, month, day, year] = match;
  const normalizedMonth = month.padStart(2, "0");
  const normalizedDay = day.padStart(2, "0");
  const result = `${year}-${normalizedMonth}-${normalizedDay}`;
  const date = new Date(`${result}T00:00:00`);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== Number(year) ||
    date.getMonth() + 1 !== Number(normalizedMonth) ||
    date.getDate() !== Number(normalizedDay)
  ) {
    return "";
  }

  return result;
}

function parseCsvAmount(value) {
  const trimmed = String(value || "")
    .trim()
    .replace(/[$,]/g, "");

  if (!trimmed) {
    return NaN;
  }

  const normalized =
    trimmed.startsWith("(") && trimmed.endsWith(")")
      ? `-${trimmed.slice(1, -1)}`
      : trimmed;

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : NaN;
}

function parseTransactionsCsv(text) {
  const lines = String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error(
      "The CSV must contain a header row and at least one transaction."
    );
  }

  const headers = parseCsvLine(lines[0]).map((header) =>
    header
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
  );

  const requiredHeaders = [
    "date",
    "description",
    "amount",
    "category"
  ];

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length) {
    throw new Error(
      `Missing required column${
        missingHeaders.length > 1 ? "s" : ""
      }: ${missingHeaders.join(", ")}`
    );
  }

  const columnIndex = Object.fromEntries(
    requiredHeaders.map((header) => [
      header,
      headers.indexOf(header)
    ])
  );

  const rows = [];
  const errors = [];

  lines.slice(1).forEach((line, index) => {
    const rowNumber = index + 2;
    const values = parseCsvLine(line);

    const date = parseCsvDate(
      values[columnIndex.date]
    );

    const description = String(
      values[columnIndex.description] || ""
    ).trim();

    const amount = parseCsvAmount(
      values[columnIndex.amount]
    );

    const category = String(
      values[columnIndex.category] || ""
    ).trim();

    const rowErrors = [];

    if (!date) rowErrors.push("invalid date");
    if (!description) rowErrors.push("missing description");
    if (!Number.isFinite(amount)) rowErrors.push("invalid amount");
    if (!category) rowErrors.push("missing category");

    if (rowErrors.length) {
      errors.push(
        `Row ${rowNumber}: ${rowErrors.join(", ")}.`
      );
      return;
    }

    rows.push({
      date,
      description: description.slice(0, 200),
      amount,
      category: category.slice(0, 100)
    });
  });

  return { rows, errors };
}

/* -------------------------------------------------------
   APP
------------------------------------------------------- */

export default function App() {
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem("budgetapp-unlocked") === "true"
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
    [budgets]
  );

  async function loadData() {
    setLoading(true);
    setAppError("");

    try {
      const [
        transactionsData,
        budgetsData,
        accountsData,
        wealthHistoryData
      ] = await Promise.all([
        api("/api/transactions"),
        api("/api/budgets"),
        api("/api/accounts"),
        api("/api/wealth-history")
      ]);

      setTransactions(normalizeArray(transactionsData));
      setBudgets(normalizeArray(budgetsData));
      setAccounts(normalizeArray(accountsData));
      setWealthHistory(normalizeArray(wealthHistoryData));
    } catch (error) {
      console.error(error);
      setAppError(error.message || "Failed to load application data.");
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
      sessionStorage.setItem("budgetapp-unlocked", "true");
      setUnlocked(true);
      setPin("");
    }
  }

  function lock() {
    sessionStorage.removeItem("budgetapp-unlocked");
    setUnlocked(false);
    setPin("");
  }

  function changeMonth(direction) {
    const current = new Date(`${selectedMonth}-01T00:00:00`);

    current.setMonth(current.getMonth() + direction);

    setSelectedMonth(current.toISOString().slice(0, 7));
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
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        lock={lock}
      />

      <main className="main">
        {appError && (
          <div className="error-banner">
            {appError}
            <button
              className="text-button"
              onClick={loadData}
            >
              Retry
            </button>
          </div>
        )}

        {activePage === "dashboard" && (
          <Dashboard
            transactions={transactions}
            budgets={budgets}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            setActivePage={setActivePage}
            openTransactionModal={() =>
              setModal({ type: "transaction" })
            }
          />
        )}

        {activePage === "transactions" && (
          <TransactionsPage
            transactions={transactions}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            categories={categories}
            setTransactions={setTransactions}
            setTransactionError={setTransactionError}
            openTransactionModal={() =>
              setModal({ type: "transaction" })
            }
            openCsvImportModal={() =>
              setModal({ type: "csv-import" })
            }
            transactionError={transactionError}
          />
        )}

        {activePage === "budgets" && (
          <BudgetsPage
            budgets={budgets}
            setBudgets={setBudgets}
            categories={categories}
            openBudgetModal={() =>
              setModal({ type: "budget" })
            }
          />
        )}

        {activePage === "wealth" && (
          <WealthPage
            accounts={accounts}
            setAccounts={setAccounts}
            wealthHistory={wealthHistory}
            setWealthHistory={setWealthHistory}
          />
        )}

        {activePage === "settings" && (
          <SettingsPage
            loadData={loadData}
            lock={lock}
          />
        )}

        <MobileNav
          activePage={activePage}
          setActivePage={setActivePage}
        />
      </main>

      {modal?.type === "transaction" && (
        <TransactionModal
          categories={categories}
          close={() => setModal(null)}
          onSaved={(transaction) => {
            setTransactions((current) => [
              transaction,
              ...current
            ]);
            setModal(null);
          }}
        />
      )}

      {modal?.type === "budget" && (
        <BudgetModal
          close={() => setModal(null)}
          onSaved={(budget) => {
            setBudgets((current) => [...current, budget]);
            setModal(null);
          }}
        />
      )}

      {modal?.type === "csv-import" && (
        <CsvImportModal
          close={() => setModal(null)}
          onImported={(importedTransactions) => {
            setTransactions((current) => [
              ...importedTransactions,
              ...current
            ]);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------
   SIDEBAR
------------------------------------------------------- */

function Sidebar({ activePage, setActivePage, lock }) {
  const items = [
    ["dashboard", "Dashboard", "⌂"],
    ["transactions", "Transactions", "↔"],
    ["budgets", "Budgets", "◫"],
    ["wealth", "Wealth", "◆"],
    ["settings", "Settings", "⚙"]
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">B</div>
        <div>
          <strong>Budget App</strong>
          <span className="sidebar-label">
            Personal Finance
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map(([page, label, icon]) => (
          <button
            key={page}
            className={`nav-item ${
              activePage === page ? "active" : ""
            }`}
            onClick={() => setActivePage(page)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-lock">
        <button
          className="lock-button"
          onClick={lock}
        >
          🔒 Lock
        </button>
      </div>
    </aside>
  );
}

function MobileNav({ activePage, setActivePage }) {
  const items = [
    ["dashboard", "Home", "⌂"],
    ["transactions", "Transactions", "↔"],
    ["budgets", "Budgets", "◫"],
    ["wealth", "Wealth", "◆"]
  ];

  return (
    <nav className="mobile-nav">
      {items.map(([page, label, icon]) => (
        <button
          key={page}
          className={`mobile-nav-item ${
            activePage === page ? "active" : ""
          }`}
          onClick={() => setActivePage(page)}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}

/* -------------------------------------------------------
   MONTH NAVIGATOR
------------------------------------------------------- */

function MonthNavigator({
  selectedMonth,
  setSelectedMonth
}) {
  function move(direction) {
    const date = new Date(
      `${selectedMonth}-01T00:00:00`
    );

    date.setMonth(date.getMonth() + direction);

    setSelectedMonth(
      date.toISOString().slice(0, 7)
    );
  }

  return (
    <div className="month-navigator">
      <button
        className="month-arrow"
        onClick={() => move(-1)}
      >
        ←
      </button>

      <span className="month-label">
        {formatMonth(selectedMonth)}
      </span>

      <button
        className="month-arrow"
        onClick={() => move(1)}
      >
        →
      </button>
    </div>
  );
}

/* -------------------------------------------------------
   DASHBOARD
------------------------------------------------------- */

function Dashboard({
  transactions,
  budgets,
  selectedMonth,
  setSelectedMonth,
  setActivePage,
  openTransactionModal
}) {
  const monthTransactions = transactions.filter(
    (transaction) =>
      monthKey(transaction.date) === selectedMonth
  );

  const income = monthTransactions
    .filter((transaction) => Number(transaction.amount) > 0)
    .reduce(
      (sum, transaction) =>
        sum + Number(transaction.amount),
      0
    );

  const expenses = Math.abs(
    monthTransactions
      .filter((transaction) => Number(transaction.amount) < 0)
      .reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount),
        0
      )
  );

  const net = income - expenses;

  const categoryTotals = budgets
    .map((budget) => {
      const spent = Math.abs(
        monthTransactions
          .filter(
            (transaction) =>
              transaction.category === budget.category &&
              Number(transaction.amount) < 0
          )
          .reduce(
            (sum, transaction) =>
              sum + Number(transaction.amount),
            0
          )
      );

      return {
        ...budget,
        spent
      };
    })
    .filter(
      (category) =>
        category.spent > 0 ||
        Number(category.amount) > 0
    );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="section-kicker">
            Overview
          </div>
          <h1>Dashboard</h1>
        </div>

        <div className="header-action">
          <MonthNavigator
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />

          <button
            className="primary-button"
            onClick={openTransactionModal}
          >
            + Add Transaction
          </button>
        </div>
      </header>

      <section className="balance-hero">
        <div>
          <div className="eyebrow">
            Net cash flow
          </div>

          <div className="hero-number">
            {money(net)}
          </div>

          <div className="hero-caption">
            {formatMonth(selectedMonth)}
          </div>
        </div>

        <div className="hero-side">
          <div>
            <span>Income</span>
            <strong>{money(income)}</strong>
          </div>

          <div>
            <span>Expenses</span>
            <strong>{money(expenses)}</strong>
          </div>
        </div>
      </section>

      <section className="summary-grid">
        <SummaryCard
          title="Income"
          value={money(income)}
          subtitle="Money received"
        />

        <SummaryCard
          title="Expenses"
          value={money(expenses)}
          subtitle="Money spent"
        />

        <SummaryCard
          title="Remaining"
          value={money(net)}
          subtitle="Income minus expenses"
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel spending-panel">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                Spending
              </div>
              <h2>By Category</h2>
            </div>

            <button
              className="text-button"
              onClick={() =>
                setActivePage("budgets")
              }
            >
              View budgets
            </button>
          </div>

          <div className="category-list">
            {categoryTotals.length === 0 ? (
              <div className="empty-state">
                No spending yet.
              </div>
            ) : (
              categoryTotals.map((category) => {
                const budgetAmount =
                  Number(category.amount) || 0;

                const percentage =
                  budgetAmount > 0
                    ? Math.min(
                        100,
                        (category.spent /
                          budgetAmount) *
                          100
                      )
                    : 0;

                return (
                  <div
                    className="category-row"
                    key={category.category}
                  >
                    <div className="category-heading">
                      <div className="category-name">
                        <span className="category-icon">
                          {categoryIcon(
                            category.category
                          )}
                        </span>

                        {category.category}
                      </div>

                      <span className="category-meta">
                        {money(category.spent)} /{" "}
                        {money(budgetAmount)}
                      </span>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percentage}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="panel transactions-panel">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                Activity
              </div>
              <h2>Recent Transactions</h2>
            </div>

            <button
              className="text-button"
              onClick={() =>
                setActivePage("transactions")
              }
            >
              View all
            </button>
          </div>

          <TransactionList
            transactions={monthTransactions.slice(0, 6)}
          />
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle
}) {
  return (
    <div className="summary-card">
      <div className="section-kicker">
        {title}
      </div>

      <strong>{value}</strong>

      <span>{subtitle}</span>
    </div>
  );
}

/* -------------------------------------------------------
   TRANSACTIONS
------------------------------------------------------- */

function TransactionsPage({
  transactions,
  selectedMonth,
  setSelectedMonth,
  categories,
  setTransactions,
  setTransactionError,
  openTransactionModal,
  openCsvImportModal,
  transactionError
}) {
  const monthTransactions = transactions.filter(
    (transaction) =>
      monthKey(transaction.date) === selectedMonth
  );

  async function deleteTransaction(id) {
    if (!window.confirm("Delete this transaction?")) {
      return;
    }

    setTransactionError("");

    try {
      await api(`/api/transactions/${id}`, {
        method: "DELETE"
      });

      setTransactions((current) =>
        current.filter(
          (transaction) => transaction.id !== id
        )
      );
    } catch (error) {
      setTransactionError(error.message);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="section-kicker">
            Activity
          </div>
          <h1>Transactions</h1>
        </div>

        <div className="header-action">
          <MonthNavigator
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />

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

      {transactionError && (
        <div className="error-banner">
          {transactionError}
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="section-kicker">
              {formatMonth(selectedMonth)}
            </div>
            <h2>Transactions</h2>
          </div>
        </div>

        <TransactionList
          transactions={monthTransactions}
          onDelete={deleteTransaction}
        />
      </div>
    </div>
  );
}

function TransactionList({
  transactions,
  onDelete
}) {
  if (!transactions.length) {
    return (
      <div className="empty-state">
        No transactions for this month.
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction) => {
        const amount = Number(transaction.amount);

        return (
          <div
            className="transaction-row"
            key={transaction.id}
          >
            <div className="transaction-icon">
              {categoryIcon(
                transaction.category
              )}
            </div>

            <div className="transaction-info">
              <strong>
                {transaction.description}
              </strong>

              <span>
                {transaction.category} ·{" "}
                {formatDate(transaction.date)}
              </span>
            </div>

            <div
              className={`transaction-amount ${
                amount > 0 ? "income" : ""
              }`}
            >
              {money(amount)}
            </div>

            {onDelete && (
              <Tooltip title="Delete transaction" arrow>
                <button
                  className="delete-button"
                  onClick={() =>
                    onDelete(transaction.id)
                  }
                  aria-label={`Delete ${transaction.description}`}
                >
                  ×
                </button>
              </Tooltip>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------
   BUDGETS
------------------------------------------------------- */

function BudgetsPage({
  budgets,
  setBudgets,
  categories,
  openBudgetModal
}) {
  async function updateBudget(id, amount) {
    try {
      const updated = await api(
        `/api/budgets/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            amount: Number(amount) || 0
          })
        }
      );

      setBudgets((current) =>
        current.map((budget) =>
          budget.id === id ? updated : budget
        )
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function deleteBudget(id) {
    if (!window.confirm("Remove this budget?")) {
      return;
    }

    try {
      await api(`/api/budgets/${id}`, {
        method: "DELETE"
      });

      setBudgets((current) =>
        current.filter(
          (budget) => budget.id !== id
        )
      );
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="section-kicker">
            Planning
          </div>
          <h1>Budgets</h1>
        </div>

        <button
          className="primary-button"
          onClick={openBudgetModal}
        >
          + Add Budget
        </button>
      </header>

      <div className="budget-page-grid">
        <div className="panel budget-editor">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                Monthly
              </div>
              <h2>Budget Categories</h2>
            </div>
          </div>

          <div className="budget-list">
            {budgets.map((budget) => (
              <div
                className="budget-row"
                key={budget.id}
              >
                <div className="budget-category">
                  <span className="category-icon">
                    {categoryIcon(
                      budget.category
                    )}
                  </span>

                  <strong>
                    {budget.category}
                  </strong>
                </div>

                <div className="budget-row-actions">
                  <div className="budget-input-wrapper">
                    <span>$</span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={budget.amount}
                      onChange={(event) =>
                        setBudgets((current) =>
                          current.map((item) =>
                            item.id === budget.id
                              ? {
                                  ...item,
                                  amount:
                                    event.target.value
                                }
                              : item
                          )
                        )
                      }
                      onBlur={(event) =>
                        updateBudget(
                          budget.id,
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <button
                    className="budget-remove-button"
                    onClick={() =>
                      deleteBudget(budget.id)
                    }
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel add-budget-panel">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                Categories
              </div>
              <h2>Available Categories</h2>
            </div>
          </div>

          <div className="category-list">
            {categories.map((category) => (
              <div
                className="category-row"
                key={category}
              >
                <div className="category-name">
                  <span className="category-icon">
                    {categoryIcon(category)}
                  </span>
                  {category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   WEALTH
------------------------------------------------------- */

function WealthPage({
  accounts,
  setAccounts,
  wealthHistory,
  setWealthHistory
}) {
  const assets = accounts.filter(
    (account) => account.type === "asset"
  );

  const liabilities = accounts.filter(
    (account) => account.type === "liability"
  );

  const totalAssets = assets.reduce(
    (sum, account) =>
      sum + Number(account.balance || 0),
    0
  );

  const totalLiabilities = liabilities.reduce(
    (sum, account) =>
      sum + Number(account.balance || 0),
    0
  );

  const netWorth =
    totalAssets - totalLiabilities;

  async function updateAccount(id, balance) {
    try {
      const updated = await api(
        `/api/accounts/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            balance: Number(balance) || 0
          })
        }
      );

      setAccounts((current) =>
        current.map((account) =>
          account.id === id
            ? updated
            : account
        )
      );
    } catch (error) {
      alert(error.message);
    }
  }

  async function saveSnapshot() {
    try {
      const snapshot = await api(
        "/api/wealth-history",
        {
          method: "POST",
          body: JSON.stringify({
            date: getInitialDate(),
            net_worth: netWorth
          })
        }
      );

      setWealthHistory((current) => [
        snapshot,
        ...current
      ]);
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="section-kicker">
            Net worth
          </div>
          <h1>Wealth</h1>
        </div>

        <button
          className="primary-button"
          onClick={saveSnapshot}
        >
          Save Snapshot
        </button>
      </header>

      <section className="wealth-overview">
        <div className="wealth-overview-main">
          <div className="wealth-eyebrow">
            Current Net Worth
          </div>

          <div className="wealth-net-worth">
            {money(netWorth)}
          </div>

          <div className="wealth-net-worth-caption">
            Assets minus liabilities
          </div>
        </div>

        <div className="wealth-breakdown">
          <div className="wealth-breakdown-item">
            <span className="wealth-dot asset-dot" />
            <div>
              <small>Assets</small>
              <strong>
                {money(totalAssets)}
              </strong>
            </div>
          </div>

          <div className="wealth-breakdown-item">
            <span className="wealth-dot liability-dot" />
            <div>
              <small>Liabilities</small>
              <strong>
                {money(totalLiabilities)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="wealth-account-grid">
        <div className="wealth-account-section">
          <div className="wealth-section-heading">
            <div>
              <div className="wealth-section-kicker">
                Assets
              </div>
              <h2>Accounts</h2>
            </div>

            <strong className="wealth-section-total asset-text">
              {money(totalAssets)}
            </strong>
          </div>

          <div className="wealth-account-list">
            {assets.map((account) => (
              <WealthAccountRow
                key={account.id}
                account={account}
                onSave={updateAccount}
              />
            ))}
          </div>
        </div>

        <div className="wealth-account-section">
          <div className="wealth-section-heading">
            <div>
              <div className="wealth-section-kicker">
                Liabilities
              </div>
              <h2>Debt</h2>
            </div>

            <strong className="wealth-section-total liability-text">
              {money(totalLiabilities)}
            </strong>
          </div>

          <div className="wealth-account-list">
            {liabilities.map((account) => (
              <WealthAccountRow
                key={account.id}
                account={account}
                onSave={updateAccount}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="panel wealth-panel">
        <div className="wealth-panel-header">
          <div>
            <div className="section-kicker">
              History
            </div>
            <h2>Net Worth Snapshots</h2>
          </div>
        </div>

        {wealthHistory.length === 0 ? (
          <div className="wealth-history-empty">
            <div className="wealth-history-icon">
              ◆
            </div>
            <p>
              No wealth snapshots yet.
            </p>
          </div>
        ) : (
          <div className="wealth-history-list">
            {wealthHistory.map((item) => (
              <div
                className="wealth-history-item"
                key={item.id}
              >
                <span className="wealth-history-date">
                  {formatDate(item.date)}
                </span>

                <span className="wealth-history-marker">
                  ◆
                </span>

                <strong>
                  {money(item.net_worth)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function WealthAccountRow({
  account,
  onSave
}) {
  const [value, setValue] = useState(
    account.balance
  );

  useEffect(() => {
    setValue(account.balance);
  }, [account.balance]);

  return (
    <div className="wealth-account-row">
      <div className="wealth-account-icon">
        {account.type === "asset"
          ? "◆"
          : "−"}
      </div>

      <div className="wealth-account-info">
        <strong>{account.name}</strong>
        <span>
          {account.type === "asset"
            ? "Asset"
            : "Liability"}
        </span>
      </div>

      <input
        className={`wealth-account-input ${
          account.type === "liability"
            ? "liability-input"
            : ""
        }`}
        type="number"
        step="0.01"
        value={value}
        onChange={(event) =>
          setValue(event.target.value)
        }
        onBlur={() =>
          onSave(account.id, value)
        }
      />
    </div>
  );
}

/* -------------------------------------------------------
   SETTINGS
------------------------------------------------------- */

function SettingsPage({
  loadData,
  lock
}) {
  const [status, setStatus] = useState("");

  async function testApi() {
    setStatus("Testing API...");

    try {
      const result = await api("/api/health");

      setStatus(
        result?.status === "ok"
          ? "API connection is working."
          : "API responded successfully."
      );
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="section-kicker">
            Preferences
          </div>
          <h1>Settings</h1>
        </div>
      </header>

      <div className="settings-page-grid">
        <div className="panel settings-panel">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                Application
              </div>
              <h2>Data</h2>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <strong>Refresh data</strong>
              <span>
                Reload everything from PostgreSQL.
              </span>
            </div>

            <button
              className="secondary-button"
              onClick={loadData}
            >
              Refresh
            </button>
          </div>

          <div className="settings-row">
            <div>
              <strong>API connection</strong>
              <span>
                Check the Express backend.
              </span>
            </div>

            <button
              className="secondary-button"
              onClick={testApi}
            >
              Test
            </button>
          </div>

          {status && (
            <div className="form-error">
              {status}
            </div>
          )}
        </div>

        <div className="panel settings-panel">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                Security
              </div>
              <h2>Session</h2>
            </div>
          </div>

          <div className="settings-row danger-row">
            <div>
              <strong>Lock Budget App</strong>
              <span>
                Require your PIN again.
              </span>
            </div>

            <button
              className="danger-button"
              onClick={lock}
            >
              Lock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   TRANSACTION MODAL
------------------------------------------------------- */

function TransactionModal({
  categories,
  close,
  onSaved
}) {
  const [form, setForm] = useState({
    date: getInitialDate(),
    description: "",
    amount: "",
    category: "Food",
    type: "expense"
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function submit(event) {
    event.preventDefault();

    setError("");

    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setSaving(true);

    const amount =
      form.type === "income"
        ? Math.abs(Number(form.amount))
        : -Math.abs(Number(form.amount));

    try {
      const transaction = await api(
        "/api/transactions",
        {
          method: "POST",
          body: JSON.stringify({
            date: form.date,
            description:
              form.description.trim(),
            amount,
            category: form.category
          })
        }
      );

      onSaved(transaction);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Add Transaction"
      close={close}
    >
      <form
        className="modal-form"
        onSubmit={submit}
      >
        <div className="form-grid">
          <label className="form-field">
            <span>Date</span>

            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                update("date", event.target.value)
              }
            />
          </label>

          <label className="form-field">
            <span>Type</span>

            <select
              value={form.type}
              onChange={(event) =>
                update("type", event.target.value)
              }
            >
              <option value="expense">
                Expense
              </option>
              <option value="income">
                Income
              </option>
            </select>
          </label>
        </div>

        <label className="form-field">
          <span>Description</span>

          <input
            type="text"
            placeholder="e.g. Grocery store"
            value={form.description}
            onChange={(event) =>
              update(
                "description",
                event.target.value
              )
            }
          />
        </label>

        <div className="form-grid">
          <label className="form-field">
            <span>Amount</span>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(event) =>
                update(
                  "amount",
                  event.target.value
                )
              }
            />
          </label>

          <label className="form-field">
            <span>Category</span>

            <select
              value={form.category}
              onChange={(event) =>
                update(
                  "category",
                  event.target.value
                )
              }
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}

              <option value="Income">
                Income
              </option>
            </select>
          </label>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={close}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* -------------------------------------------------------
   CSV IMPORT MODAL
------------------------------------------------------- */

function CsvImportModal({ close, onImported }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setRows([]);
    setErrors([]);
    setError("");

    try {
      const text = await file.text();
      const parsed = parseTransactionsCsv(text);

      setRows(parsed.rows);
      setErrors(parsed.errors);

      if (!parsed.rows.length && parsed.errors.length) {
        setError(
          "No valid transactions were found in the CSV."
        );
      }
    } catch (parseError) {
      setError(
        parseError.message ||
          "Could not read the CSV file."
      );
    }
  }

  async function importTransactions() {
    if (
      !rows.length ||
      errors.length ||
      importing
    ) {
      return;
    }

    setImporting(true);
    setError("");

    const imported = [];

    try {
      for (const row of rows) {
        const transaction = await api(
          "/api/transactions",
          {
            method: "POST",
            body: JSON.stringify(row)
          }
        );

        imported.push(transaction);
      }

      onImported(imported);
    } catch (importError) {
      setError(
        imported.length
          ? `Imported ${imported.length} transaction${
              imported.length === 1 ? "" : "s"
            } before the import stopped. ${
              importError.message
            }`
          : importError.message
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <Modal
      title="Import Transactions"
      close={close}
    >
      <div className="modal-form">
        <div className="csv-upload">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            disabled={importing}
          />

          <p>
            Required columns: date, description, amount,
            category. Amounts may be positive for income or
            negative for expenses.
          </p>
        </div>

        {fileName && (
          <div className="csv-preview-header">
            <strong>{fileName}</strong>

            <span>
              {rows.length} valid row
              {rows.length === 1 ? "" : "s"}
            </span>
          </div>
        )}

        {rows.length > 0 && (
          <div className="csv-preview">
            {rows.slice(0, 8).map((row, index) => (
              <div
                className="csv-preview-row"
                key={`${row.date}-${row.description}-${index}`}
              >
                <span>{formatDate(row.date)}</span>

                <strong>{row.description}</strong>

                <span>{money(row.amount)}</span>
              </div>
            ))}

            {rows.length > 8 && (
              <div className="csv-more">
                + {rows.length - 8} more row
                {rows.length - 8 === 1 ? "" : "s"}
              </div>
            )}
          </div>
        )}

        {errors.length > 0 && (
          <div className="form-error">
            <strong>
              {errors.length} row
              {errors.length === 1 ? "" : "s"} need
              attention.
            </strong>

            <div style={{ marginTop: 6 }}>
              {errors.slice(0, 5).map((message) => (
                <div key={message}>{message}</div>
              ))}

              {errors.length > 5 && (
                <div style={{ marginTop: 4 }}>
                  + {errors.length - 5} more error
                  {errors.length - 5 === 1 ? "" : "s"}
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={close}
            disabled={importing}
          >
            Cancel
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={importTransactions}
            disabled={
              !rows.length ||
              errors.length > 0 ||
              importing
            }
          >
            {importing
              ? "Importing..."
              : `Import ${rows.length || ""} Transaction${
                  rows.length === 1 ? "" : "s"
                }`.trim()}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------
   BUDGET MODAL
------------------------------------------------------- */

function BudgetModal({
  close,
  onSaved
}) {
  const [category, setCategory] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  async function submit(event) {
    event.preventDefault();

    setError("");

    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    setSaving(true);

    try {
      const budget = await api(
        "/api/budgets",
        {
          method: "POST",
          body: JSON.stringify({
            category: category.trim(),
            amount: Number(amount) || 0
          })
        }
      );

      onSaved(budget);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Add Budget"
      close={close}
    >
      <form
        className="modal-form"
        onSubmit={submit}
      >
        <label className="form-field">
          <span>Category</span>

          <input
            type="text"
            placeholder="e.g. Travel"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          />
        </label>

        <label className="form-field">
          <span>Monthly Amount</span>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
          />
        </label>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={close}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Budget"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* -------------------------------------------------------
   GENERIC MODAL
------------------------------------------------------- */

function Modal({
  title,
  close,
  children
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>

          <button
            className="modal-close"
            onClick={close}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   LOCK SCREEN
------------------------------------------------------- */

function LockScreen({
  pin,
  setPin,
  unlock
}) {
  function handleKey(event) {
    if (event.key === "Enter") {
      unlock();
    }
  }

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <div className="lock-logo">
          B
        </div>

        <div className="section-kicker">
          Personal Finance
        </div>

        <h1>Budget App</h1>

        <p>
          Enter your PIN to continue.
        </p>

        <input
          className="pin-input"
          type="password"
          inputMode="numeric"
          maxLength="4"
          value={pin}
          onChange={(event) =>
            setPin(
              event.target.value.replace(
                /\D/g,
                ""
              )
            )
          }
          onKeyDown={handleKey}
          autoFocus
        />

        <button
          className="pin-button"
          onClick={unlock}
        >
          Unlock
        </button>
      </div>
    </div>
  );
}