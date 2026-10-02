
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const defaultTransactions = [
  {
    id: 1,
    name: "Paycheck",
    category: "Income",
    amount: 4129.88,
    type: "income",
    date: "2026-10-01",
  },
  {
    id: 2,
    name: "Rent",
    category: "Housing",
    amount: 1150,
    type: "expense",
    date: "2026-10-01",
  },
  {
    id: 3,
    name: "Groceries",
    category: "Food",
    amount: 86.42,
    type: "expense",
    date: "2026-10-01",
  },
  {
    id: 4,
    name: "Gas",
    category: "Transportation",
    amount: 42.15,
    type: "expense",
    date: "2026-10-01",
  },
];

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

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("budgetapp-transactions");

    return saved ? JSON.parse(saved) : defaultTransactions;
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

  const income = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);

  const expenses = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);

  const remaining = income - expenses;

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

    setTransactions((current) => [newTransaction, ...current]);

    setName("");
    setAmount("");
  }

  function deleteTransaction(id) {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id)
    );
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">October 2026</p>
          <h1>Budget</h1>
        </div>

        <button
          className="month-button"
          onClick={() => alert("Month selector coming next.")}
        >
          October
        </button>
      </header>

      <main>
        <section className="summary-card">
          <p>Remaining</p>

          <h2 className={remaining < 0 ? "negative" : ""}>
            {formatCurrency(remaining)}
          </h2>

          <div className="summary-details">
            <div>
              <span>Income</span>
              <strong className="income">
                {formatCurrency(income)}
              </strong>
            </div>

            <div>
              <span>Spent</span>
              <strong className="expense">
                {formatCurrency(expenses)}
              </strong>
            </div>
          </div>
        </section>

        <section className="quick-add">
          <div className="section-heading">
            <h2>Add transaction</h2>
          </div>

          <div className="type-toggle">
            <button
              className={type === "expense" ? "active expense-tab" : ""}
              onClick={() => setType("expense")}
            >
              Expense
            </button>

            <button
              className={type === "income" ? "active income-tab" : ""}
              onClick={() => setType("income")}
            >
              Income
            </button>
          </div>

          <form onSubmit={addTransaction}>
            <input
              type="text"
              placeholder={
                type === "income" ? "Income name" : "What did you spend on?"
              }
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="Amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />

            {type === "expense" && (
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}

            <button className="add-button" type="submit">
              + Add transaction
            </button>
          </form>
        </section>

        <section className="transactions">
          <div className="section-heading">
            <h2>Transactions</h2>
            <span>{transactions.length}</span>
          </div>

          <div className="transaction-list">
            {transactions.length === 0 ? (
              <div className="empty">
                <p>No transactions yet.</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <article className="transaction" key={transaction.id}>
                  <div className="transaction-icon">
                    {transaction.type === "income" ? "+" : "−"}
                  </div>

                  <div className="transaction-info">
                    <strong>{transaction.name}</strong>
                    <span>
                      {transaction.category} · {transaction.date}
                    </span>
                  </div>

                  <div className="transaction-right">
                    <strong
                      className={
                        transaction.type === "income"
                          ? "income"
                          : "expense"
                      }
                    >
                      {transaction.type === "income" ? "+" : "−"}
                      {formatCurrency(transaction.amount)}
                    </strong>

                    <button
                      className="delete-button"
                      onClick={() => deleteTransaction(transaction.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <nav className="bottom-nav">
        <button className="selected">
          <span>▣</span>
          Budget
        </button>

        <button onClick={() => alert("Reports coming next.")}>
          <span>◔</span>
          Reports
        </button>

        <button onClick={() => alert("Settings coming next.")}>
          <span>⚙</span>
          Settings
        </button>
      </nav>
    </div>
  );
}

export default App;
