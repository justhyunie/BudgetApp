import { useEffect, useMemo, useState } from "react";
import "./App.css";

const PIN = "3517";

const TRANSACTION_STORAGE = "budgetapp-transactions";
const BUDGET_STORAGE = "budgetapp-budgets";
const ACCOUNT_STORAGE = "budgetapp-accounts";
const WEALTH_HISTORY_STORAGE = "budgetapp-wealth-history";
const UNLOCK_STORAGE = "budgetapp-unlocked";

const defaultCategories = [
  "Housing",
  "Food",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Subscriptions",
  "Debt",
  "Other",
];

const categoryIcons = {
  Housing: "⌂",
  Food: "🍔",
  Transportation: "🚗",
  Utilities: "💡",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Health: "♥",
  Subscriptions: "↻",
  Debt: "▣",
  Other: "•••",
};

const initialTransactions = [
  {
    id: 1,
    name: "Paycheck",
    category: "Income",
    amount: 4129.88,
    type: "income",
    date: "2026-10-01",
  },
];

const initialBudgets = {
  Housing: 1150,
  Food: 400,
  Transportation: 200,
  Utilities: 200,
  Entertainment: 150,
  Shopping: 200,
  Health: 100,
  Subscriptions: 100,
  Debt: 200,
  Other: 100,
};

const initialAccounts = [
  { id: 1, name: "Checking", type: "asset", balance: 0 },
  { id: 2, name: "Savings", type: "asset", balance: 0 },
  { id: 3, name: "401(k)", type: "asset", balance: 0 },
  { id: 4, name: "Roth IRA", type: "asset", balance: 0 },
  { id: 5, name: "Student Loans", type: "liability", balance: 0 },
];

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

function shortMoney(value) {
  const number = Number(value) || 0;

  if (Math.abs(number) >= 1000000) {
    return `$${(number / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(number) >= 1000) {
    return `$${(number / 1000).toFixed(0)}k`;
  }

  return money(number);
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonth(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function monthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function parseStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getInitialDate() {
  return new Date();
}

function getMonthDate(key) {
  const [year, month] = key.split("-").map(Number);

  return new Date(year, month - 1, 1);
}

function getCategoriesFromBudgets(budgets) {
  return Object.keys(budgets);
}

export default function App() {
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem(UNLOCK_STORAGE) === "true"
  );

  const [pin, setPin] = useState("");

  const [activePage, setActivePage] = useState("dashboard");

  const [selectedMonth, setSelectedMonth] = useState(
    monthKey(getInitialDate())
  );

  const [transactions, setTransactions] = useState(() =>
    parseStored(TRANSACTION_STORAGE, initialTransactions)
  );

  const [budgets, setBudgets] = useState(() =>
    parseStored(BUDGET_STORAGE, initialBudgets)
  );

  const [accounts, setAccounts] = useState(() =>
    parseStored(ACCOUNT_STORAGE, initialAccounts)
  );

  const [wealthHistory, setWealthHistory] = useState(() =>
    parseStored(WEALTH_HISTORY_STORAGE, [])
  );

  const [modal, setModal] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      TRANSACTION_STORAGE,
      JSON.stringify(transactions)
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(
      BUDGET_STORAGE,
      JSON.stringify(budgets)
    );
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(
      ACCOUNT_STORAGE,
      JSON.stringify(accounts)
    );
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(
      WEALTH_HISTORY_STORAGE,
      JSON.stringify(wealthHistory)
    );
  }, [wealthHistory]);

  function unlockApp() {
    if (pin === PIN) {
      sessionStorage.setItem(UNLOCK_STORAGE, "true");
      setUnlocked(true);
      setPin("");
    } else {
      setPin("");
    }
  }

  function lockApp() {
    sessionStorage.removeItem(UNLOCK_STORAGE);
    setUnlocked(false);
    setPin("");
    setModal(null);
  }

  function changeMonth(amount) {
    const current = getMonthDate(selectedMonth);

    current.setMonth(current.getMonth() + amount);

    setSelectedMonth(monthKey(current));
  }

  function addTransaction(transaction) {
    setTransactions((current) => [
      ...current,
      {
        ...transaction,
        id: Date.now(),
        amount: Number(transaction.amount),
      },
    ]);

    setModal(null);
  }

  function deleteTransaction(id) {
    setTransactions((current) =>
      current.filter(
        (transaction) => transaction.id !== id
      )
    );
  }

  function updateBudget(category, amount) {
    setBudgets((current) => ({
      ...current,
      [category]: Number(amount) || 0,
    }));
  }

  function addBudget(category, amount = 0) {
    const cleanName = category.trim();

    if (!cleanName) return false;

    const alreadyExists = Object.keys(budgets).some(
      (existing) =>
        existing.toLowerCase() === cleanName.toLowerCase()
    );

    if (alreadyExists) {
      return false;
    }

    setBudgets((current) => ({
      ...current,
      [cleanName]: Number(amount) || 0,
    }));

    return true;
  }

  function removeBudget(category) {
    setBudgets((current) => {
      const next = { ...current };

      delete next[category];

      return next;
    });
  }

  function resetBudgets() {
    setBudgets(initialBudgets);
  }

  function addAccount(account) {
    setAccounts((current) => [
      ...current,
      {
        ...account,
        id: Date.now(),
        balance: Number(account.balance) || 0,
      },
    ]);

    setModal(null);
  }

  function updateAccount(id, value) {
    setAccounts((current) =>
      current.map((account) =>
        account.id === id
          ? {
              ...account,
              balance: Number(value) || 0,
            }
          : account
      )
    );
  }

  const categories = useMemo(() => {
    return getCategoriesFromBudgets(budgets);
  }, [budgets]);

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((transaction) =>
      transaction.date.startsWith(selectedMonth)
    );
  }, [transactions, selectedMonth]);

  const monthlyIncome = useMemo(() => {
    return currentMonthTransactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount),
        0
      );
  }, [currentMonthTransactions]);

  const monthlyExpenses = useMemo(() => {
    return currentMonthTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount),
        0
      );
  }, [currentMonthTransactions]);

  const monthlyRemaining =
    monthlyIncome - monthlyExpenses;

  const totalBudget = Object.values(budgets).reduce(
    (sum, amount) => sum + Number(amount),
    0
  );

  const budgetRemaining =
    totalBudget - monthlyExpenses;

  const unallocated =
    monthlyIncome - totalBudget;

  const monthlySavingsRate =
    monthlyIncome > 0
      ? (monthlyRemaining / monthlyIncome) * 100
      : 0;

  const categorySpending = categories.map(
    (category) => {
      const spent = currentMonthTransactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.category === category
        )
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount),
          0
        );

      return {
        category,
        spent,
        budget: Number(budgets[category]) || 0,
      };
    }
  );

  const totalAssets = accounts
    .filter(
      (account) => account.type === "asset"
    )
    .reduce(
      (sum, account) =>
        sum + Number(account.balance || 0),
      0
    );

  const totalLiabilities = accounts
    .filter(
      (account) => account.type === "liability"
    )
    .reduce(
      (sum, account) =>
        sum + Number(account.balance || 0),
      0
    );

  const netWorth =
    totalAssets - totalLiabilities;

  const averageMonthlySurplus =
    monthlyRemaining > 0
      ? monthlyRemaining
      : 0;

  const projection = [5, 10, 15, 20, 25, 30].map(
    (years) => {
      const annualReturn = 0.07;
      const monthlyRate = annualReturn / 12;
      const months = years * 12;
      const monthlyContribution =
        averageMonthlySurplus;

      let futureValue = netWorth;

      if (monthlyContribution > 0) {
        futureValue =
          netWorth *
            Math.pow(
              1 + monthlyRate,
              months
            ) +
          monthlyContribution *
            ((Math.pow(
              1 + monthlyRate,
              months
            ) -
              1) /
              monthlyRate);
      } else {
        futureValue =
          netWorth *
          Math.pow(
            1 + monthlyRate,
            months
          );
      }

      return {
        years,
        value: Math.max(0, futureValue),
      };
    }
  );

  if (!unlocked) {
    return (
      <div className="lock-screen">
        <div className="lock-card">
          <div className="lock-logo">$</div>

          <h1>BudgetApp</h1>

          <p>
            Enter your PIN to continue.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              unlockApp();
            }}
          >
            <input
              className="pin-input"
              type="password"
              inputMode="numeric"
              maxLength="4"
              autoFocus
              value={pin}
              onChange={(event) =>
                setPin(
                  event.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="••••"
            />

            <button
              className="primary-button pin-button"
              type="submit"
              disabled={pin.length !== 4}
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        lockApp={lockApp}
      />

      <main className="main">
        <div className="page">
          {activePage === "dashboard" && (
            <Dashboard
              selectedMonth={selectedMonth}
              changeMonth={changeMonth}
              monthlyIncome={monthlyIncome}
              monthlyExpenses={monthlyExpenses}
              monthlyRemaining={monthlyRemaining}
              budgetRemaining={budgetRemaining}
              totalBudget={totalBudget}
              unallocated={unallocated}
              monthlySavingsRate={
                monthlySavingsRate
              }
              categorySpending={
                categorySpending
              }
              transactions={
                currentMonthTransactions
              }
              setActivePage={setActivePage}
              setModal={setModal}
              lockApp={lockApp}
            />
          )}

          {activePage === "transactions" && (
            <TransactionsPage
              selectedMonth={selectedMonth}
              changeMonth={changeMonth}
              transactions={
                currentMonthTransactions
              }
              setModal={setModal}
              deleteTransaction={
                deleteTransaction
              }
              lockApp={lockApp}
            />
          )}

          {activePage === "budgets" && (
            <BudgetsPage
              budgets={budgets}
              categories={categories}
              updateBudget={updateBudget}
              addBudget={addBudget}
              removeBudget={removeBudget}
              resetBudgets={resetBudgets}
              monthlyExpenses={
                monthlyExpenses
              }
              categorySpending={
                categorySpending
              }
              lockApp={lockApp}
            />
          )}

          {activePage === "wealth" && (
            <WealthPage
              accounts={accounts}
              totalAssets={totalAssets}
              totalLiabilities={
                totalLiabilities
              }
              netWorth={netWorth}
              wealthHistory={
                wealthHistory
              }
              setWealthHistory={
                setWealthHistory
              }
              projection={projection}
              updateAccount={
                updateAccount
              }
              setModal={setModal}
              lockApp={lockApp}
            />
          )}

          {activePage === "settings" && (
            <SettingsPage
              lockApp={lockApp}
              setTransactions={
                setTransactions
              }
              setBudgets={setBudgets}
              setAccounts={setAccounts}
              setWealthHistory={
                setWealthHistory
              }
            />
          )}
        </div>
      </main>

      <MobileNav
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <button
        className="floating-add"
        onClick={() =>
          setModal("transaction")
        }
        aria-label="Add transaction"
      >
        +
      </button>

      {modal === "transaction" && (
        <TransactionModal
          onClose={() => setModal(null)}
          onSave={addTransaction}
          categories={categories}
        />
      )}

      {modal === "account" && (
        <AccountModal
          onClose={() => setModal(null)}
          onSave={addAccount}
        />
      )}

      {modal === "import" && (
        <CsvImportModal
          onClose={() => setModal(null)}
          onImport={(items) => {
            setTransactions((current) => [
              ...current,
              ...items.map(
                (item, index) => ({
                  ...item,
                  id:
                    Date.now() +
                    index,
                })
              ),
            ]);

            setModal(null);
          }}
        />
      )}
    </div>
  );
}

function Sidebar({
  activePage,
  setActivePage,
  lockApp,
}) {
  const items = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: "≡",
    },
    {
      id: "budgets",
      label: "Budgets",
      icon: "▤",
    },
    {
      id: "wealth",
      label: "Wealth",
      icon: "↗",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">$</div>

        <div>
          <strong>BudgetApp</strong>
          <span>Personal finance</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-label">
          OVERVIEW
        </div>

        {items.slice(0, 3).map((item) => (
          <button
            key={item.id}
            className={
              activePage === item.id
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage(item.id)
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="sidebar-label wealth-nav-label">
          WEALTH
        </div>

        <button
          className={
            activePage === "wealth"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActivePage("wealth")
          }
        >
          <span>↗</span>
          Net Worth
        </button>

        <div className="sidebar-label">
          SYSTEM
        </div>

        <button
          className={
            activePage === "settings"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActivePage("settings")
          }
        >
          <span>⚙</span>
          Settings
        </button>
      </nav>

      <button
        className="sidebar-lock"
        onClick={lockApp}
      >
        Lock application
      </button>
    </aside>
  );
}

function MobileNav({
  activePage,
  setActivePage,
}) {
  const items = [
    ["dashboard", "⌂", "Home"],
    ["transactions", "≡", "Activity"],
    ["wealth", "↗", "Wealth"],
    ["budgets", "▤", "Budget"],
  ];

  return (
    <nav className="mobile-nav">
      {items.map(
        ([id, icon, label]) => (
          <button
            key={id}
            className={
              activePage === id
                ? "mobile-nav-item active"
                : "mobile-nav-item"
            }
            onClick={() =>
              setActivePage(id)
            }
          >
            <span>{icon}</span>
            <small>{label}</small>
          </button>
        )
      )}
    </nav>
  );
}

function MonthNavigator({
  month,
  changeMonth,
}) {
  const date = getMonthDate(month);

  return (
    <div className="month-navigator">
      <button
        type="button"
        className="month-arrow"
        onClick={() =>
          changeMonth(-1)
        }
        aria-label="Previous month"
      >
        <span aria-hidden="true">
          ‹
        </span>
      </button>

      <div className="month-label">
        {formatMonth(date)}
      </div>

      <button
        type="button"
        className="month-arrow"
        onClick={() =>
          changeMonth(1)
        }
        aria-label="Next month"
      >
        <span aria-hidden="true">
          ›
        </span>
      </button>
    </div>
  );
}

function LockButton({ lockApp }) {
  return (
    <button
      className="lock-button"
      onClick={lockApp}
      title="Lock application"
      aria-label="Lock application"
    >
      <span>⌑</span>
      <span>Lock</span>
    </button>
  );
}

function Dashboard({
  selectedMonth,
  changeMonth,
  monthlyIncome,
  monthlyExpenses,
  monthlyRemaining,
  budgetRemaining,
  totalBudget,
  unallocated,
  monthlySavingsRate,
  categorySpending,
  transactions,
  setActivePage,
  setModal,
  lockApp,
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Your financial picture for{" "}
            {formatMonth(
              getMonthDate(
                selectedMonth
              )
            )}
            .
          </p>
        </div>

        <div className="header-action">
          <MonthNavigator
            month={selectedMonth}
            changeMonth={changeMonth}
          />

          <button
            className="secondary-button"
            onClick={() =>
              setModal("import")
            }
          >
            Import CSV
          </button>

          <button
            className="primary-button"
            onClick={() =>
              setModal("transaction")
            }
          >
            + Transaction
          </button>

          <LockButton
            lockApp={lockApp}
          />
        </div>
      </header>

      <section className="balance-hero">
        <div>
          <span className="eyebrow">
            REMAINING THIS MONTH
          </span>

          <div className="hero-number">
            {money(monthlyRemaining)}
          </div>

          <div className="hero-caption">
            {monthlySavingsRate.toFixed(
              0
            )}
            % of income remaining
          </div>
        </div>

        <div className="hero-side">
          <div>
            <span>Income</span>
            <strong>
              {money(monthlyIncome)}
            </strong>
          </div>

          <div>
            <span>Expenses</span>
            <strong>
              {money(monthlyExpenses)}
            </strong>
          </div>
        </div>
      </section>

      <section className="summary-grid">
        <SummaryCard
          label="Monthly budget"
          value={money(totalBudget)}
        />

        <SummaryCard
          label="Budget remaining"
          value={money(
            budgetRemaining
          )}
          tone={
            budgetRemaining < 0
              ? "negative"
              : "positive"
          }
        />

        <SummaryCard
          label="Unallocated"
          value={money(unallocated)}
          tone={
            unallocated < 0
              ? "negative"
              : "positive"
          }
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel spending-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                THIS MONTH
              </span>

              <h2>Spending</h2>
            </div>

            <button
              className="text-button"
              onClick={() =>
                setActivePage(
                  "transactions"
                )
              }
            >
              View all
            </button>
          </div>

          <div className="category-list">
            {categorySpending.map(
              (item) => {
                const percent =
                  item.budget > 0
                    ? Math.min(
                        (item.spent /
                          item.budget) *
                          100,
                        100
                      )
                    : item.spent > 0
                    ? 100
                    : 0;

                return (
                  <div
                    className="category-row"
                    key={
                      item.category
                    }
                  >
                    <div className="category-heading">
                      <div className="category-name">
                        <span className="category-icon">
                          {categoryIcons[
                            item
                              .category
                          ] ||
                            "•"}
                        </span>

                        <span>
                          {
                            item.category
                          }
                        </span>
                      </div>

                      <span>
                        {money(
                          item.spent
                        )}
                      </span>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percent}%`,
                        }}
                      />
                    </div>

                    <div className="category-meta">
                      <span>
                        {item.budget >
                        0
                          ? `${money(
                              item.budget
                            )} budget`
                          : "No budget"}
                      </span>

                      {item.budget >
                        0 && (
                        <span>
                          {Math.round(
                            percent
                          )}
                          %
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="panel transactions-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                ACTIVITY
              </span>

              <h2>
                Recent transactions
              </h2>
            </div>

            <button
              className="text-button"
              onClick={() =>
                setActivePage(
                  "transactions"
                )
              }
            >
              View all
            </button>
          </div>

          <TransactionList
            transactions={transactions
              .slice(-7)
              .reverse()}
          />
        </div>
      </section>
    </>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}) {
  return (
    <div className="summary-card">
      <span>{label}</span>

      <strong
        className={
          tone === "positive"
            ? "positive"
            : tone === "negative"
            ? "negative"
            : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}

function TransactionsPage({
  selectedMonth,
  changeMonth,
  transactions,
  setModal,
  deleteTransaction,
  lockApp,
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>Transactions</h1>

          <p>
            Every transaction for{" "}
            {formatMonth(
              getMonthDate(
                selectedMonth
              )
            )}
            .
          </p>
        </div>

        <div className="header-action">
          <MonthNavigator
            month={selectedMonth}
            changeMonth={changeMonth}
          />

          <button
            className="secondary-button"
            onClick={() =>
              setModal("import")
            }
          >
            Import CSV
          </button>

          <button
            className="primary-button"
            onClick={() =>
              setModal("transaction")
            }
          >
            + Transaction
          </button>

          <LockButton
            lockApp={lockApp}
          />
        </div>
      </header>

      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="section-kicker">
              LEDGER
            </span>

            <h2>
              {transactions.length}{" "}
              transaction
              {transactions.length ===
              1
                ? ""
                : "s"}
            </h2>
          </div>
        </div>

        <TransactionList
          transactions={[
            ...transactions,
          ].reverse()}
          showDelete
          deleteTransaction={
            deleteTransaction
          }
        />
      </div>
    </>
  );
}

function TransactionList({
  transactions,
  showDelete = false,
  deleteTransaction,
}) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <strong>
          No transactions yet.
        </strong>

        <span>
          Add a transaction or import
          a CSV file.
        </span>
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
              {transaction.type ===
              "income"
                ? "+"
                : categoryIcons[
                    transaction
                      .category
                  ] || "•"}
            </div>

            <div className="transaction-info">
              <strong>
                {transaction.name}
              </strong>

              <span>
                {
                  transaction.category
                }{" "}
                ·{" "}
                {formatDate(
                  transaction.date
                )}
              </span>
            </div>

            <div
              className={
                transaction.type ===
                "income"
                  ? "transaction-amount income"
                  : "transaction-amount"
              }
            >
              {transaction.type ===
              "income"
                ? "+"
                : "-"}
              {money(
                transaction.amount
              )}
            </div>

            {showDelete && (
              <button
                className="delete-button"
                onClick={() =>
                  deleteTransaction(
                    transaction.id
                  )
                }
                title="Delete transaction"
              >
                ×
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}

function BudgetsPage({
  budgets,
  categories,
  updateBudget,
  addBudget,
  removeBudget,
  resetBudgets,
  categorySpending,
  lockApp,
}) {
  const [showAddBudget, setShowAddBudget] =
    useState(false);

  const [newBudgetName, setNewBudgetName] =
    useState("");

  const [newBudgetAmount, setNewBudgetAmount] =
    useState("");

  const totalBudget = Object.values(
    budgets
  ).reduce(
    (sum, amount) =>
      sum + Number(amount),
    0
  );

  function submitNewBudget(event) {
    event.preventDefault();

    const success = addBudget(
      newBudgetName,
      newBudgetAmount
    );

    if (!success) {
      return;
    }

    setNewBudgetName("");
    setNewBudgetAmount("");
    setShowAddBudget(false);
  }

  function handleRemove(category) {
    const spending =
      categorySpending.find(
        (item) =>
          item.category === category
      );

    if (
      spending &&
      Number(spending.spent) > 0
    ) {
      const confirmed =
        window.confirm(
          `${category} has ${money(
            spending.spent
          )} in spending this month. Remove this budget category anyway?`
        );

      if (!confirmed) {
        return;
      }
    }

    removeBudget(category);
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Budgets</h1>

          <p>
            Build and manage your monthly
            spending plan.
          </p>
        </div>

        <div className="header-action">
          <button
            className="secondary-button"
            onClick={resetBudgets}
          >
            Reset
          </button>

          <button
            className="primary-button"
            onClick={() =>
              setShowAddBudget(
                (current) => !current
              )
            }
          >
            + Budget
          </button>

          <LockButton
            lockApp={lockApp}
          />
        </div>
      </header>

      {showAddBudget && (
        <div className="panel budget-add-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                NEW CATEGORY
              </span>

              <h2>
                Add a budget
              </h2>
            </div>
          </div>

          <form
            className="budget-add-form"
            onSubmit={submitNewBudget}
          >
            <div className="budget-add-field">
              <label>
                Category name
              </label>

              <input
                autoFocus
                value={newBudgetName}
                onChange={(event) =>
                  setNewBudgetName(
                    event.target.value
                  )
                }
                placeholder="e.g. Travel"
              />
            </div>

            <div className="budget-add-field budget-add-amount">
              <label>
                Monthly budget
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  newBudgetAmount
                }
                onChange={(event) =>
                  setNewBudgetAmount(
                    event.target.value
                  )
                }
                placeholder="0.00"
              />
            </div>

            <div className="budget-add-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowAddBudget(
                    false
                  );
                  setNewBudgetName("");
                  setNewBudgetAmount(
                    ""
                  );
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={
                  !newBudgetName.trim()
                }
              >
                Add budget
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel budget-editor">
        <div className="panel-header">
          <div>
            <span className="section-kicker">
              MONTHLY PLAN
            </span>

            <h2>
              Budget allocation
            </h2>
          </div>

          <strong>
            {money(totalBudget)}
          </strong>
        </div>

        <div className="budget-list">
          {categories.length ===
          0 ? (
            <div className="empty-state">
              <strong>
                No budgets yet.
              </strong>

              <span>
                Add your first budget
                category above.
              </span>
            </div>
          ) : (
            categories.map(
              (category) => {
                const spending =
                  categorySpending.find(
                    (item) =>
                      item.category ===
                      category
                  );

                const spent =
                  spending?.spent ||
                  0;

                const budget =
                  Number(
                    budgets[category]
                  ) || 0;

                const percent =
                  budget > 0
                    ? Math.min(
                        (spent /
                          budget) *
                          100,
                        100
                      )
                    : 0;

                return (
                  <div
                    className="budget-row"
                    key={category}
                  >
                    <div className="budget-category">
                      <span className="category-icon">
                        {categoryIcons[
                          category
                        ] || "•"}
                      </span>

                      <div>
                        <strong>
                          {category}
                        </strong>

                        <span>
                          {money(
                            spent
                          )}{" "}
                          spent
                          {budget >
                            0 &&
                            ` · ${Math.round(
                              percent
                            )}%`}
                        </span>
                      </div>
                    </div>

                    <div className="budget-row-right">
                      <div className="budget-input-wrapper">
                        <span>
                          $
                        </span>

                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={
                            budgets[
                              category
                            ]
                          }
                          onChange={(
                            event
                          ) =>
                            updateBudget(
                              category,
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className="budget-remove-button"
                        onClick={() =>
                          handleRemove(
                            category
                          )
                        }
                        title={`Remove ${category} budget`}
                        aria-label={`Remove ${category} budget`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>
    </>
  );
}

function WealthPage({
  accounts,
  totalAssets,
  totalLiabilities,
  netWorth,
  wealthHistory,
  setWealthHistory,
  projection,
  updateAccount,
  setModal,
  lockApp,
}) {
  function saveSnapshot() {
    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    const snapshot = {
      id: Date.now(),
      date: today,
      netWorth,
    };

    setWealthHistory(
      (current) => [
        ...current.filter(
          (item) =>
            item.date !== today
        ),
        snapshot,
      ]
    );
  }

  const assets = accounts.filter(
    (account) =>
      account.type === "asset"
  );

  const liabilities =
    accounts.filter(
      (account) =>
        account.type ===
        "liability"
    );

  const assetPercent =
    totalAssets > 0
      ? Math.min(
          (netWorth /
            totalAssets) *
            100,
          100
        )
      : 0;

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Wealth</h1>

          <p>
            Track your assets, debt,
            and long-term financial
            progress.
          </p>
        </div>

        <div className="header-action">
          <button
            className="secondary-button"
            onClick={saveSnapshot}
          >
            Save snapshot
          </button>

          <button
            className="primary-button"
            onClick={() =>
              setModal("account")
            }
          >
            + Account
          </button>

          <LockButton
            lockApp={lockApp}
          />
        </div>
      </header>

      <section className="wealth-overview">
        <div className="wealth-overview-main">
          <div className="wealth-eyebrow">
            TOTAL NET WORTH
          </div>

          <div className="wealth-net-worth">
            {money(netWorth)}
          </div>

          <div className="wealth-net-worth-caption">
            What you own after
            subtracting what you owe
          </div>
        </div>

        <div className="wealth-breakdown">
          <div className="wealth-breakdown-item">
            <span className="wealth-dot asset-dot" />

            <div>
              <small>
                Assets
              </small>

              <strong>
                {money(totalAssets)}
              </strong>
            </div>
          </div>

          <div className="wealth-breakdown-item">
            <span className="wealth-dot liability-dot" />

            <div>
              <small>
                Liabilities
              </small>

              <strong>
                {money(
                  totalLiabilities
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className="wealth-equity-bar">
          <div
            className="wealth-equity-fill"
            style={{
              width: `${assetPercent}%`,
            }}
          />
        </div>

        <div className="wealth-equity-labels">
          <span>
            Net equity
          </span>

          <span>
            {assetPercent.toFixed(
              0
            )}
            % of assets
          </span>
        </div>
      </section>

      <section className="wealth-account-grid">
        <div className="wealth-account-section">
          <div className="wealth-section-heading">
            <div>
              <span className="wealth-section-kicker">
                WHAT YOU OWN
              </span>

              <h2>
                Assets
              </h2>
            </div>

            <strong className="wealth-section-total asset-text">
              {money(totalAssets)}
            </strong>
          </div>

          <div className="wealth-account-list">
            {assets.length ===
            0 ? (
              <div className="wealth-empty">
                No assets added
                yet.
              </div>
            ) : (
              assets.map(
                (account) => (
                  <WealthAccountRow
                    key={
                      account.id
                    }
                    account={
                      account
                    }
                    updateAccount={
                      updateAccount
                    }
                    type="asset"
                  />
                )
              )
            )}
          </div>
        </div>

        <div className="wealth-account-section">
          <div className="wealth-section-heading">
            <div>
              <span className="wealth-section-kicker">
                WHAT YOU OWE
              </span>

              <h2>
                Liabilities
              </h2>
            </div>

            <strong className="wealth-section-total liability-text">
              {money(
                totalLiabilities
              )}
            </strong>
          </div>

          <div className="wealth-account-list">
            {liabilities.length ===
            0 ? (
              <div className="wealth-empty">
                No liabilities
                added yet.
              </div>
            ) : (
              liabilities.map(
                (account) => (
                  <WealthAccountRow
                    key={
                      account.id
                    }
                    account={
                      account
                    }
                    updateAccount={
                      updateAccount
                    }
                    type="liability"
                  />
                )
              )
            )}
          </div>
        </div>
      </section>

      <section className="wealth-panel">
        <div className="wealth-panel-header">
          <div>
            <span className="wealth-section-kicker">
              OVER TIME
            </span>

            <h2>
              Net worth history
            </h2>

            <p>
              Save periodic
              snapshots to see how
              your wealth changes.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={saveSnapshot}
          >
            Record current value
          </button>
        </div>

        {wealthHistory.length ===
        0 ? (
          <div className="wealth-history-empty">
            <div className="wealth-history-icon">
              ↗
            </div>

            <strong>
              Your wealth history
              starts here.
            </strong>

            <p>
              Update your account
              balances and record a
              snapshot.
            </p>
          </div>
        ) : (
          <div className="wealth-history-list">
            {[
              ...wealthHistory,
            ]
              .sort((a, b) =>
                b.date.localeCompare(
                  a.date
                )
              )
              .map(
                (
                  snapshot,
                  index,
                  sorted
                ) => {
                  const previous =
                    sorted[
                      index + 1
                    ]?.netWorth;

                  const change =
                    previous !==
                    undefined
                      ? snapshot.netWorth -
                        previous
                      : null;

                  return (
                    <div
                      className="wealth-history-item"
                      key={
                        snapshot.id
                      }
                    >
                      <div className="wealth-history-date">
                        <span className="wealth-history-marker" />

                        <span>
                          {formatDate(
                            snapshot.date
                          )}
                        </span>
                      </div>

                      <strong>
                        {money(
                          snapshot.netWorth
                        )}
                      </strong>

                      {change !==
                        null && (
                        <span
                          className={
                            change >=
                            0
                              ? "wealth-change positive"
                              : "wealth-change negative"
                          }
                        >
                          {change >=
                          0
                            ? "+"
                            : ""}
                          {money(
                            change
                          )}
                        </span>
                      )}
                    </div>
                  );
                }
              )}
          </div>
        )}
      </section>

      <section className="wealth-panel projection-panel">
        <div className="wealth-panel-header">
          <div>
            <span className="wealth-section-kicker">
              LONG TERM
            </span>

            <h2>
              Illustrative wealth
              projection
            </h2>

            <p>
              Based on your current
              net worth and monthly
              surplus, assuming a 7%
              annual return.
            </p>
          </div>
        </div>

        <div className="wealth-projection">
          {projection.map(
            (item) => {
              const max =
                projection[
                  projection.length -
                    1
                ]?.value || 1;

              const width =
                Math.max(
                  8,
                  (item.value /
                    max) *
                    100
                );

              return (
                <div
                  className="wealth-projection-row"
                  key={
                    item.years
                  }
                >
                  <div className="projection-years">
                    {item.years} yr
                  </div>

                  <div className="projection-bar-track">
                    <div
                      className="projection-bar-fill"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>

                  <strong>
                    {shortMoney(
                      item.value
                    )}
                  </strong>
                </div>
              );
            }
          )}
        </div>

        <div className="projection-disclaimer">
          This is a mathematical
          illustration, not a
          prediction. Actual
          investment returns and
          future contributions will
          vary.
        </div>
      </section>
    </>
  );
}

function WealthAccountRow({
  account,
  updateAccount,
  type,
}) {
  let icon = "◫";

  if (type === "liability") {
    icon = "−";
  } else if (
    account.name
      .toLowerCase()
      .includes("401")
  ) {
    icon = "▥";
  } else if (
    account.name
      .toLowerCase()
      .includes("roth")
  ) {
    icon = "◈";
  }

  return (
    <div className="wealth-account-row">
      <div className="wealth-account-icon">
        {icon}
      </div>

      <div className="wealth-account-info">
        <strong>
          {account.name}
        </strong>

        <span>
          {type === "asset"
            ? "Asset account"
            : "Liability account"}
        </span>
      </div>

      <input
        className={`wealth-account-input ${
          type === "liability"
            ? "liability-input"
            : ""
        }`}
        type="number"
        step="0.01"
        value={account.balance}
        onChange={(event) =>
          updateAccount(
            account.id,
            event.target.value
          )
        }
      />
    </div>
  );
}

function SettingsPage({
  lockApp,
  setTransactions,
  setBudgets,
  setAccounts,
  setWealthHistory,
}) {
  function resetEverything() {
    const confirmed =
      window.confirm(
        "Reset all BudgetApp data? This cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    setTransactions(
      initialTransactions
    );

    setBudgets(
      initialBudgets
    );

    setAccounts(
      initialAccounts
    );

    setWealthHistory([]);

    localStorage.removeItem(
      TRANSACTION_STORAGE
    );

    localStorage.removeItem(
      BUDGET_STORAGE
    );

    localStorage.removeItem(
      ACCOUNT_STORAGE
    );

    localStorage.removeItem(
      WEALTH_HISTORY_STORAGE
    );
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>
            Settings
          </h1>

          <p>
            Manage your BudgetApp
            preferences and data.
          </p>
        </div>

        <LockButton
          lockApp={lockApp}
        />
      </header>

      <div className="panel settings-panel">
        <div className="settings-row">
          <div>
            <strong>
              Application lock
            </strong>

            <span>
              The app is protected by
              a local PIN.
            </span>
          </div>

          <button
            className="secondary-button"
            onClick={lockApp}
          >
            Lock now
          </button>
        </div>

        <div className="settings-row danger-row">
          <div>
            <strong>
              Reset application
              data
            </strong>

            <span>
              Delete locally stored
              transactions, budgets,
              accounts, and wealth
              history.
            </span>
          </div>

          <button
            className="danger-button"
            onClick={
              resetEverything
            }
          >
            Reset data
          </button>
        </div>
      </div>
    </>
  );
}

function TransactionModal({
  onClose,
  onSave,
  categories,
}) {
  const [form, setForm] =
    useState({
      name: "",
      category:
        categories[0] ||
        "Other",
      amount: "",
      type: "expense",
      date: new Date()
        .toISOString()
        .slice(0, 10),
    });

  function update(
    field,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function submit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    if (!form.amount) {
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      amount: Number(
        form.amount
      ),
      category:
        form.type ===
        "income"
          ? "Income"
          : form.category,
    });
  }

  return (
    <Modal
      title="Add transaction"
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={submit}
      >
        <div className="form-field">
          <label>
            Name
          </label>

          <input
            autoFocus
            value={form.name}
            onChange={(event) =>
              update(
                "name",
                event.target.value
              )
            }
            placeholder="e.g. Grocery store"
          />
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>
              Type
            </label>

            <select
              value={form.type}
              onChange={(event) =>
                update(
                  "type",
                  event.target.value
                )
              }
            >
              <option value="expense">
                Expense
              </option>

              <option value="income">
                Income
              </option>
            </select>
          </div>

          <div className="form-field">
            <label>
              Amount
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={
                form.amount
              }
              onChange={(event) =>
                update(
                  "amount",
                  event.target.value
                )
              }
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>
              Category
            </label>

            <select
              value={
                form.category
              }
              onChange={(event) =>
                update(
                  "category",
                  event.target.value
                )
              }
              disabled={
                form.type ===
                "income"
              }
            >
              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={
                      category
                    }
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-field">
            <label>
              Date
            </label>

            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                update(
                  "date",
                  event.target.value
                )
              }
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            Add transaction
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AccountModal({
  onClose,
  onSave,
}) {
  const [form, setForm] =
    useState({
      name: "",
      type: "asset",
      balance: "",
    });

  function submit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      balance:
        Number(
          form.balance
        ) || 0,
    });
  }

  return (
    <Modal
      title="Add account"
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={submit}
      >
        <div className="form-field">
          <label>
            Account name
          </label>

          <input
            autoFocus
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name: event.target
                  .value,
              })
            }
            placeholder="e.g. Fidelity Roth IRA"
          />
        </div>

        <div className="form-field">
          <label>
            Account type
          </label>

          <select
            value={form.type}
            onChange={(event) =>
              setForm({
                ...form,
                type: event.target
                  .value,
              })
            }
          >
            <option value="asset">
              Asset
            </option>

            <option value="liability">
              Liability
            </option>
          </select>
        </div>

        <div className="form-field">
          <label>
            Current balance
          </label>

          <input
            type="number"
            step="0.01"
            value={
              form.balance
            }
            onChange={(event) =>
              setForm({
                ...form,
                balance:
                  event.target
                    .value,
              })
            }
            placeholder="0.00"
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            Add account
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CsvImportModal({
  onClose,
  onImport,
}) {
  const [rows, setRows] =
    useState([]);

  const [error, setError] =
    useState("");

  function parseCsv(text) {
    const lines = text
      .split(/\r?\n/)
      .map((line) =>
        line.trim()
      )
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error(
        "The CSV needs a header row and at least one transaction."
      );
    }

    const headers = lines[0]
      .split(",")
      .map((header) =>
        header
          .trim()
          .toLowerCase()
      );

    const dateIndex =
      headers.findIndex(
        (header) =>
          header === "date" ||
          header.includes("date")
      );

    const descriptionIndex =
      headers.findIndex(
        (header) =>
          header ===
            "description" ||
          header === "name" ||
          header.includes(
            "description"
          ) ||
          header.includes(
            "merchant"
          )
      );

    const amountIndex =
      headers.findIndex(
        (header) =>
          header === "amount" ||
          header.includes(
            "amount"
          )
      );

    if (
      dateIndex === -1 ||
      descriptionIndex === -1 ||
      amountIndex === -1
    ) {
      throw new Error(
        "CSV must contain Date, Description, and Amount columns."
      );
    }

    return lines
      .slice(1)
      .map((line) => {
        const columns =
          line
            .split(",")
            .map((value) =>
              value
                .trim()
                .replace(
                  /^"|"$/g,
                  ""
                )
            );

        const rawAmount =
          columns[
            amountIndex
          ]
            .replace(
              "$",
              ""
            )
            .replace(
              /,/g,
              ""
            );

        const amount =
          Number(
            rawAmount
          );

        if (
          !Number.isFinite(
            amount
          )
        ) {
          return null;
        }

        return {
          name:
            columns[
              descriptionIndex
            ] ||
            "Imported transaction",
          category:
            "Other",
          amount:
            Math.abs(
              amount
            ),
          type:
            amount >= 0
              ? "income"
              : "expense",
          date:
            normalizeCsvDate(
              columns[
                dateIndex
              ]
            ),
        };
      })
      .filter(Boolean);
  }

  function normalizeCsvDate(
    value
  ) {
    if (!value) {
      return new Date()
        .toISOString()
        .slice(0, 10);
    }

    const slashMatch =
      value.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      );

    if (slashMatch) {
      const [
        ,
        month,
        day,
        year,
      ] = slashMatch;

      return `${year}-${String(
        month
      ).padStart(
        2,
        "0"
      )}-${String(day).padStart(
        2,
        "0"
      )}`;
    }

    const date =
      new Date(value);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date
        .toISOString()
        .slice(0, 10);
    }

    return new Date()
      .toISOString()
      .slice(0, 10);
  }

  function handleFile(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const reader =
      new FileReader();

    reader.onload = () => {
      try {
        const parsed =
          parseCsv(
            reader.result
          );

        setRows(parsed);
      } catch (err) {
        setError(
          err.message
        );

        setRows([]);
      }
    };

    reader.readAsText(
      file
    );
  }

  return (
    <Modal
      title="Import transactions"
      onClose={onClose}
    >
      <div className="modal-form">
        <div className="csv-upload">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={
              handleFile
            }
          />

          <p>
            CSV should contain
            Date, Description,
            and Amount columns.
          </p>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div className="csv-preview-header">
              <strong>
                {rows.length}{" "}
                transactions found
              </strong>
            </div>

            <div className="csv-preview">
              {rows
                .slice(0, 10)
                .map(
                  (
                    row,
                    index
                  ) => (
                    <div
                      className="csv-preview-row"
                      key={
                        index
                      }
                    >
                      <span>
                        {formatDate(
                          row.date
                        )}
                      </span>

                      <strong>
                        {
                          row.name
                        }
                      </strong>

                      <span
                        className={
                          row.type ===
                          "income"
                            ? "positive"
                            : ""
                        }
                      >
                        {row.type ===
                        "income"
                          ? "+"
                          : "-"}
                        {money(
                          row.amount
                        )}
                      </span>
                    </div>
                  )
                )}
            </div>

            {rows.length >
              10 && (
              <small className="csv-more">
                Showing the
                first 10 of{" "}
                {rows.length}{" "}
                transactions.
              </small>
            )}
          </>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={
              rows.length === 0
            }
            onClick={() =>
              onImport(rows)
            }
          >
            Import{" "}
            {rows.length || ""}{" "}
            transactions
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <span className="section-kicker">
              BUDGETAPP
            </span>

            <h2>
              {title}
            </h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
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