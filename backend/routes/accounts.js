const express = require("express");
const router = express.Router();

const pool = require("../db");
const { parseId } = require("../utils/validation");

function normalizeBudget(row) {
  return {
    ...row,
    amount: Number(row.amount)
  };
}

/*
|--------------------------------------------------------------------------
| GET ALL BUDGETS
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
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

    res.json(
      result.rows.map(normalizeBudget)
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve budgets"
    });
  }
});

/*
|--------------------------------------------------------------------------
| CREATE BUDGET
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {
  try {
    const {
      category,
      amount
    } = req.body;

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
      [
        category.trim(),
        numericAmount
      ]
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

    console.error(
      "POST /api/budgets:",
      error
    );

    res.status(500).json({
      error: "Failed to create budget",
      details: error.message
    });
  }
});

/*
|--------------------------------------------------------------------------
| UPDATE BUDGET
|--------------------------------------------------------------------------
*/

router.patch("/:id", async (req, res) => {
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
      [
        numericAmount,
        id
      ]
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
    console.error(
      "PATCH /api/budgets/:id:",
      error
    );

    res.status(500).json({
      error: "Failed to update budget",
      details: error.message
    });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE BUDGET
|--------------------------------------------------------------------------
*/

router.delete("/:id", async (req, res) => {
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
    console.error(
      "DELETE /api/budgets/:id:",
      error
    );

    res.status(500).json({
      error: "Failed to delete budget",
      details: error.message
    });
  }
});

module.exports = router;