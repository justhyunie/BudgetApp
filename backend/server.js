require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");

const app = express();

const port = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
});

app.use(helmet());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later."
  }
});

app.use("/api/", apiLimiter);

function parseId(id) {
  const value = Number(id);

  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

function normalizeTransaction(row) {
  return {
    ...row,
    amount: Number(row.amount)
  };
}

function normalizeBudget(row) {
  return {
    ...row,
    amount: Number(row.amount)
  };
}

function normalizeAccount(row) {
  return {
    ...row,
    balance: Number(row.balance)
  };
}

function normalizeWealth(row) {
  return {
    ...row,
    net_worth: Number(row.net_worth)
  };
}

/*
|--------------------------------------------------------------------------
| HEALTH
|--------------------------------------------------------------------------
*/

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      database: "connected",
      time: result.rows[0].now
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      database: "disconnected"
    });
  }
});

/*
|--------------------------------------------------------------------------
| TRANSACTIONS
|--------------------------------------------------------------------------
*/

app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        date,
        description,
        amount,
        category, type,
        created_at
      FROM transactions
      ORDER BY date DESC, id DESC
    `);

    res.json(result.rows.map(normalizeTransaction));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve transactions"
    });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const {
      date,
      description,
      amount,
      category,
      type,
    } = req.body;

    const numericAmount = Math.abs(Number(amount));

    if (!date) {
      return res.status(400).json({
        error: "Date is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        error: "Description is required",
      });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        error: "Amount must be greater than zero",
      });
    }

    const transactionType =
      type === "income" ? "income" : "expense";

    const transactionCategory =
      transactionType === "income"
        ? "Income"
        : category || "Other";

    const result = await pool.query(
      `
        INSERT INTO transactions (
          date,
          description,
          amount,
          category,
          type
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          date,
          description,
          amount,
          category,
          type,
          created_at
      `,
      [
        date,
        description.trim(),
        numericAmount,
        transactionCategory,
        transactionType,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(
      "POST /api/transactions:",
      error,
    );

    res.status(500).json({
      error: "Failed to create transaction",
      details: error.message,
    });
  }
});
app.patch("/api/transactions/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Transaction ID must be a positive integer"
      });
    }

    const { date, description, amount, category } = req.body;

    const numericAmount = Number(amount);

    if (!date || !description || !category) {
      return res.status(400).json({
        error: "Date, description, amount, and category are required"
      });
    }

    if (!Number.isFinite(numericAmount)) {
      return res.status(400).json({
        error: "Amount must be a number"
      });
    }

    const result = await pool.query(
      `
      UPDATE transactions
      SET
        date = $1,
        description = $2,
        amount = $3,
        category = $4
      WHERE id = $5
      RETURNING *
      `,
      [
        date,
        description.trim(),
        numericAmount,
        category.trim(),
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Transaction not found"
      });
    }

    res.json(normalizeTransaction(result.rows[0]));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update transaction"
    });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Transaction ID must be a positive integer"
      });
    }

    const result = await pool.query(
      `
      DELETE FROM transactions
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Transaction not found"
      });
    }

    res.json({
      message: "Transaction deleted",
      transaction: normalizeTransaction(result.rows[0])
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete transaction"
    });
  }
});

/*
|--------------------------------------------------------------------------
| BUDGETS
|--------------------------------------------------------------------------
*/

app.get("/api/budgets", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        category,
        amount,
        created_at
      FROM budgets
      ORDER BY category ASC
    `);

    res.json(result.rows.map(normalizeBudget));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve budgets"
    });
  }
});

app.post("/api/budgets", async (req, res) => {
  try {
    const { category, amount } = req.body;

    const numericAmount = Number(amount);

    if (!category || typeof category !== "string") {
      return res.status(400).json({
        error: "Budget category is required"
      });
    }

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        error: "Budget amount must be a valid positive number"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO budgets
        (category, amount)
      VALUES
        ($1, $2)
      RETURNING *
      `,
      [category.trim(), numericAmount]
    );

    res.status(201).json(
      normalizeBudget(result.rows[0])
    );
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A budget for this category already exists"
      });
    }

    console.error(error);

    res.status(500).json({
      error: "Failed to create budget"
    });
  }
});

app.patch("/api/budgets/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Budget ID must be a positive integer"
      });
    }

    const numericAmount = Number(req.body.amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        error: "Budget amount must be a valid positive number"
      });
    }

    const result = await pool.query(
      `
      UPDATE budgets
      SET amount = $1
      WHERE id = $2
      RETURNING *
      `,
      [numericAmount, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Budget not found"
      });
    }

    res.json(
      normalizeBudget(result.rows[0])
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update budget"
    });
  }
});

app.delete("/api/budgets/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Budget ID must be a positive integer"
      });
    }

    const result = await pool.query(
      `
      DELETE FROM budgets
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Budget not found"
      });
    }

    res.json({
      message: "Budget deleted",
      budget: normalizeBudget(result.rows[0])
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete budget"
    });
  }
});

/*
|--------------------------------------------------------------------------
| ACCOUNTS
|--------------------------------------------------------------------------
*/

app.get("/api/accounts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        type,
        balance,
        created_at
      FROM accounts
      ORDER BY name ASC
    `);

    res.json(result.rows.map(normalizeAccount));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve accounts"
    });
  }
});



app.post("/api/accounts", async (req, res) => {
  try {
    const { name, type, balance } = req.body;

    const numericBalance = Number(balance);

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        error: "Account name is required"
      });
    }

    if (!["asset", "liability"].includes(type)) {
      return res.status(400).json({
        error: "Account type must be asset or liability"
      });
    }

    if (!Number.isFinite(numericBalance)) {
      return res.status(400).json({
        error: "Account balance must be a number"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO accounts
        (name, type, balance)
      VALUES
        ($1, $2, $3)
      RETURNING *
      `,
      [
        name.trim(),
        type,
        numericBalance
      ]
    );

    res.status(201).json(
      normalizeAccount(result.rows[0])
    );
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "An account with this name already exists"
      });
    }

    console.error(error);

    res.status(500).json({
      error: "Failed to create account"
    });
  }
});

app.patch("/api/accounts/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Account ID must be a positive integer"
      });
    }

    const numericBalance = Number(req.body.balance);

    if (!Number.isFinite(numericBalance)) {
      return res.status(400).json({
        error: "Account balance must be a number"
      });
    }

    const result = await pool.query(
      `
      UPDATE accounts
      SET balance = $1
      WHERE id = $2
      RETURNING *
      `,
      [numericBalance, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Account not found"
      });
    }

    res.json(
      normalizeAccount(result.rows[0])
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update account"
    });
  }
});

app.delete("/api/accounts/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Account ID must be a positive integer"
      });
    }

    const result = await pool.query(
      `
      DELETE FROM accounts
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Account not found"
      });
    }

    res.json({
      message: "Account deleted",
      account: normalizeAccount(result.rows[0])
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete account"
    });
  }
});

/*
|--------------------------------------------------------------------------
| WEALTH HISTORY
|--------------------------------------------------------------------------
*/

app.get("/api/wealth-history", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        date,
        net_worth,
        created_at
      FROM wealth_history
      ORDER BY date ASC, id ASC
    `);

    res.json(result.rows.map(normalizeWealth));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve wealth history"
    });
  }
});

app.post("/api/wealth-history", async (req, res) => {
  try {
    const { date, net_worth } = req.body;

    const numericNetWorth = Number(net_worth);

    if (!date) {
      return res.status(400).json({
        error: "Date is required"
      });
    }

    if (!Number.isFinite(numericNetWorth)) {
      return res.status(400).json({
        error: "Net worth must be a number"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO wealth_history
        (date, net_worth)
      VALUES
        ($1, $2)
      RETURNING *
      `,
      [date, numericNetWorth]
    );

    res.status(201).json(
      normalizeWealth(result.rows[0])
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create wealth history entry"
    });
  }
});

/*
|--------------------------------------------------------------------------
| ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  res.status(500).json({
    error: "Internal server error"
  });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});