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
    const {
      date,
      description,
      amount,
      category,
      type
    } = req.body;

    const numericAmount = Math.abs(Number(amount));

    if (!date) {
      return res.status(400).json({
        error: "Date is required"
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        error: "Description is required"
      });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        error: "Amount must be greater than zero"
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
        transactionType
      ]
    );

    res.status(201).json(
      normalizeTransaction(result.rows[0])
    );
  } catch (error) {
    console.error(
      "POST /api/transactions:",
      error
    );

    res.status(500).json({
      error: "Failed to create transaction",
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
        console.error(error);
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