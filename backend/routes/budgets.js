const express = require("express");
const router = express.Router();

const pool = require("../db");
const { parseId } = require("../utils/validation");

function normalizeTransaction(row) {
  return {
    ...row,
    amount: Number(row.amount)
  };
}

function normalizeBudget(row) {
  return {
    ...row,
    amount: Number(row.amount),
  };
}

/*
|--------------------------------------------------------------------------
| GET ALL TRANSACTIONS
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        date,
        description,
        amount,
        category,
        type,
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

/*
|--------------------------------------------------------------------------
| CREATE TRANSACTION
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {
  try {
    const { category, amount } = req.body;

    const numericAmount = Number(amount);

    if (!category || !category.trim()) {
      return res.status(400).json({
        error: "Category is required"
      });
    }

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        error: "Amount must be a valid number"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO budgets (
        category,
        amount
      )
      VALUES ($1, $2)
      RETURNING *
      `,
      [
        category.trim(),
        numericAmount
      ]
    );

    res.status(201).json(
      normalizeBudget(result.rows[0])
    );
  } catch (error) {
    console.error(
      "POST /api/budgets:",
      error
    );

    if (error.code === "23505") {
      return res.status(409).json({
        error: "A budget for this category already exists"
      });
    }

    res.status(500).json({
      error: "Failed to create budget",
      details: error.message
    });
  }
});
/*
|--------------------------------------------------------------------------
| UPDATE TRANSACTION
|--------------------------------------------------------------------------
*/

router.patch("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Transaction ID must be a positive integer"
      });
    }

    const {
      date,
      description,
      amount,
      category
    } = req.body;

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

    res.json(
      normalizeTransaction(result.rows[0])
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update transaction"
    });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE TRANSACTION
|--------------------------------------------------------------------------
*/

router.delete("/:id", async (req, res) => {
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

module.exports = router;