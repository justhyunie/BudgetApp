import { useEffect, useMemo, useState } from "react";
import "./App.css";

const categories = [
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
  Shopping: "🛍",
  Health: "❤️",
  Subscriptions: "↻",
  Debt: "💳",
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

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem("budgetapp-unlocked") === "true";
  });

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  function unlockApp(event) {
    event.preventDefault();

    if (pin === "3517") {
      sessionStorage.setItem("budgetapp-unlocked", "true");
      setIsUnlocked(true);
      setPin("");
      setPinError("");
    } else {
      setPin("");
      setPinError("Incorrect PIN.");
    }
  }
  const [activeTab, setActiveTab] = useState("budget");
  const [showAdd, setShowAdd] = useState(false);
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("budgetapp-transactions");

    if (!saved) {
      return initialTransactions;
    }

    try {
      return JSON.parse(saved);
    } catch {
      return initialTransactions;
    }
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem("budgetapp-budgets");

    if (!saved) {
      return initialBudgets;
    }

    try {
      return JSON.parse(saved);
    } catch {
      return initialBudgets;
    }
  });

  const [type, setType] = useState("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  useEffect(() => {
    localStorage.setItem(
      "budgetapp-transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(
      "budgetapp-budgets",
      JSON.stringify(budgets)
    );
  }, [budgets]);

  /*
   * ============================
   * INCOME
   * ============================
   */

  const income = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);

  /*
   * ============================
   * ACTUAL EXPENSES
   * ============================
   */

  const expenses = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);

  /*
   * ============================
   * PLANNED BUDGET
   * ============================
   */

  const totalBudget = useMemo(() => {
    return Object.values(budgets).reduce(
      (total, amount) => total + Number(amount || 0),
      0
    );
  }, [budgets]);

  /*
   * ============================
   * MONEY LEFT AFTER ACTUAL
   * ============================
   */

  const remaining = income - expenses;

  /*
   * ============================
   * MONEY NOT YET ASSIGNED
   *
   * Example:
   *
   * Income = $4,000
   * Budget = $3,500
   *
   * Unallocated = $500
   * ============================
   */

  const unallocated = income - totalBudget;

  /*
   * ============================
   * TOTAL BUDGET REMAINING
   *
   * This is different from
   * actual cash remaining.
   *
   * Example:
   *
   * Food budget = $400
   * Food spending = $100
   *
   * Food remaining = $300
   * ============================
   */

  const budgetRemaining = totalBudget - expenses;

  /*
   * ============================
   * ADD TRANSACTION
   * ============================
   */

  function addTransaction(event) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!name.trim() || !numericAmount || numericAmount <= 0) {
      return;
    }

    const newTransaction = {
      id: Date.now(),
      name: name.trim(),
      category: type === "income" ? "Income" : category,
      amount: numericAmount,
      type,
      date: new Date().toISOString().split("T")[0],
    };

    setTransactions((current) => [
      newTransaction,
      ...current,
    ]);

    setName("");
    setAmount("");
    setShowAdd(false);
  }

  /*
   * ============================
   * DELETE TRANSACTION
   * ============================
   */

  function deleteTransaction(id) {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id)
    );
  }

  /*
   * ============================
   * GET ACTUAL SPENDING
   * FOR A CATEGORY
   * ============================
   */

  function getCategorySpent(categoryName) {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === "expense" &&
          transaction.category === categoryName
      )
      .reduce(
        (total, transaction) => total + transaction.amount,
        0
      );
  }

  /*
   * ============================
   * CHANGE BUDGET
   * ============================
   */

  function updateBudget(categoryName, value) {
    setBudgets((current) => ({
      ...current,
      [categoryName]: Number(value) || 0,
    }));
  }

  /*
   * ============================
   * RESET EVERYTHING
   * ============================
   */

  function resetApp() {
    if (
      !window.confirm(
        "Reset your entire budget? This will delete all transactions and restore the default budget."
      )
    ) {
      return;
    }

    setTransactions(initialTransactions);
    setBudgets(initialBudgets);
  }

  /*
   * ============================
   * BUDGET PAGE
   * ============================
   */

  function renderBudget() {
    const spendingPercent =
      totalBudget > 0
        ? Math.min((expenses / totalBudget) * 100, 100)
        : 0;

    if (!isUnlocked) {
      return (
        <div className="lock-screen">
          <div className="lock-card">
            <div className="lock-icon">🔒</div>

            <span className="eyebrow">BUDGETAPP</span>

            <h1>Enter PIN</h1>

            <p>
              Enter your PIN to view your budget and
              transactions.
            </p>

            <form onSubmit={unlockApp}>
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                maxLength="4"
                placeholder="••••"
                value={pin}
                onChange={(event) => {
                  setPin(
                    event.target.value.replace(/\D/g, "")
                  );
                  setPinError("");
                }}
              />

              {pinError && (
                <div className="pin-error">
                  {pinError}
                </div>
              )}

              <button type="submit">
                Unlock
              </button>
            </form>
          </div>
        </div>
      );
    }
  }

  /*
   * ============================
   * TRANSACTIONS PAGE
   * ============================
   */

  function renderTransactions() {
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">
            OCTOBER 2026
          </span>

          <h1>Transactions</h1>

          <p>
            Every dollar in one place.
          </p>
        </div>

        <section className="transaction-summary">
          <div>
            <span>Income</span>

            <strong className="income-text">
              {formatCurrency(income)}
            </strong>
          </div>

          <div>
            <span>Expenses</span>

            <strong className="expense-text">
              {formatCurrency(expenses)}
            </strong>
          </div>
        </section>

        <section className="section">
          <TransactionList
            transactions={transactions}
            onDelete={deleteTransaction}
          />
        </section>
      </>
    );
  }

  /*
   * ============================
   * SETTINGS
   * ============================
   */

  function renderSettings() {
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">
            BUDGETAPP
          </span>

          <h1>Settings</h1>

          <p>
            Manage your budget.
          </p>
        </div>

        <section className="settings-card">
          <div className="settings-row">
            <div>
              <strong>Currency</strong>

              <span>
                United States Dollar
              </span>
            </div>

            <span className="settings-value">
              USD
            </span>
          </div>

          <div className="settings-row">
            <div>
              <strong>Transactions</strong>

              <span>
                {transactions.length} total
              </span>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <strong>Monthly income</strong>

              <span>
                {formatCurrency(income)}
              </span>
            </div>
          </div>

          <button
            className="danger-button"
            onClick={resetApp}
          >
            Reset budget
          </button>
        </section>
      </>
    );
  }

  return (
    <div className="app-shell">
      <main className="app-content">
        {activeTab === "budget" &&
          renderBudget()}

        {activeTab === "transactions" &&
          renderTransactions()}

        {activeTab === "settings" &&
          renderSettings()}
      </main>

      {/* ADD BUTTON */}

      <button
        className="floating-add"
        onClick={() => setShowAdd(true)}
      >
        <span>+</span>
        Add
      </button>

      {/* NAVIGATION */}

      <nav className="bottom-nav">
        <button
          className={
            activeTab === "budget"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("budget")
          }
        >
          <span className="nav-icon">
            ⌂
          </span>

          <span>Budget</span>
        </button>

        <button
          className={
            activeTab === "transactions"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("transactions")
          }
        >
          <span className="nav-icon">
            ☷
          </span>

          <span>Transactions</span>
        </button>

        <button
          className={
            activeTab === "settings"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("settings")
          }
        >
          <span className="nav-icon">
            ⚙
          </span>

          <span>Settings</span>
        </button>
      </nav>

      {/* ADD TRANSACTION MODAL */}

      {showAdd && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowAdd(false)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  NEW ENTRY
                </span>

                <h2>Add transaction</h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setShowAdd(false)
                }
              >
                ×
              </button>
            </div>

            <div className="type-selector">
              <button
                className={
                  type === "expense"
                    ? "selected expense"
                    : ""
                }
                onClick={() =>
                  setType("expense")
                }
              >
                Expense
              </button>

              <button
                className={
                  type === "income"
                    ? "selected income"
                    : ""
                }
                onClick={() =>
                  setType("income")
                }
              >
                Income
              </button>
            </div>

            <form
              onSubmit={addTransaction}
              className="transaction-form"
            >
              <label>
                Description

                <input
                  autoFocus
                  type="text"
                  placeholder={
                    type === "income"
                      ? "e.g. Paycheck"
                      : "e.g. Groceries"
                  }
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Amount

                <div className="amount-input">
                  <span>$</span>

                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        event.target.value
                      )
                    }
                  />
                </div>
              </label>

              {type === "expense" && (
                <label>
                  Category

                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value
                      )
                    }
                  >
                    {categories.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </label>
              )}

              <button
                className="submit-button"
                type="submit"
              >
                Add transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BUDGET EDITOR */}

      {showBudgetEditor && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowBudgetEditor(false)
          }
        >
          <div
            className="modal budget-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  OCTOBER 2026
                </span>

                <h2>
                  Set your budget
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setShowBudgetEditor(false)
                }
              >
                ×
              </button>
            </div>

            <p className="modal-description">
              Enter the maximum amount you
              plan to spend in each category
              this month.
            </p>

            <div className="budget-total-preview">
              <div>
                <span>Monthly income</span>

                <strong>
                  {formatCurrency(income)}
                </strong>
              </div>

              <div>
                <span>Total budget</span>

                <strong>
                  {formatCurrency(
                    totalBudget
                  )}
                </strong>
              </div>

              <div>
                <span>
                  {unallocated >= 0
                    ? "Unallocated"
                    : "Over income"}
                </span>

                <strong
                  className={
                    unallocated < 0
                      ? "expense-text"
                      : ""
                  }
                >
                  {formatCurrency(
                    Math.abs(
                      unallocated
                    )
                  )}
                </strong>
              </div>
            </div>

            <div className="budget-editor">
              {categories.map((item) => (
                <label key={item}>
                  <span>{item}</span>

                  <div className="budget-input">
                    <span>$</span>

                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={
                        budgets[item]
                      }
                      onChange={(event) =>
                        updateBudget(
                          item,
                          event.target.value
                        )
                      }
                    />
                  </div>
                </label>
              ))}
            </div>

            <button
              className="submit-button"
              onClick={() =>
                setShowBudgetEditor(false)
              }
            >
              Save budget
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionList({
  transactions,
  onDelete,
}) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          ☷
        </div>

        <strong>
          No transactions yet
        </strong>

        <p>
          Add your first transaction
          using the + button.
        </p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map(
        (transaction) => (
          <article
            className="transaction-row"
            key={transaction.id}
          >
            <div
              className={`transaction-icon ${transaction.type ===
                "income"
                ? "income-icon"
                : ""
                }`}
            >
              {transaction.type ===
                "income"
                ? "↑"
                : categoryIcons[
                transaction.category
                ] || "•••"}
            </div>

            <div className="transaction-details">
              <strong>
                {transaction.name}
              </strong>

              <span>
                {transaction.category} ·{" "}
                {formatDate(
                  transaction.date
                )}
              </span>
            </div>

            <div className="transaction-amount">
              <strong
                className={
                  transaction.type ===
                    "income"
                    ? "income-text"
                    : "expense-text"
                }
              >
                {transaction.type ===
                  "income"
                  ? "+"
                  : "−"}

                {formatCurrency(
                  transaction.amount
                )}
              </strong>

              <button
                onClick={() =>
                  onDelete(
                    transaction.id
                  )
                }
              >
                Delete
              </button>
            </div>
          </article>
        )
      )}
    </div>
  );
}

export default App;