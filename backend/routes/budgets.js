
const express = require("express");
const router = express.Router();

const pool = require("../db");
const { parseId } = require("../utils/validation");

function normalizeBudget(row) {
  return {
    ...row,
    amount: Number(row.amount),
  };
}

// GET /api/budgets
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, category, amount, created_at
      FROM budgets
      ORDER BY category ASC
    `);

    res.json(result.rows.map(normalizeBudget));
  } catch (error) {
    console.error("GET /api/budgets:", error);
    res.status(500).json({
      error: "Failed to retrieve budgets",
    });
  }
});

// POST /api/budgets
router.post("/", async (req, res) => {
  try {
    const { category, amount } = req.body;

    if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({
        error: "Budget category is required",
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) < 0
    ) {
      return res.status(400).json({
        error: "Budget amount must be a valid non-negative number",
      });
    }

    const result = await pool.query(
      `INSERT INTO budgets (category, amount)
       VALUES ($1, $2)
       RETURNING *`,
      [category.trim(), Number(amount)]
    );

    res.status(201).json(normalizeBudget(result.rows[0]));
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A budget for this category already exists",
      });
    }

    console.error("POST /api/budgets:", error);
    res.status(500).json({
      error: "Failed to create budget",
    });
  }
});

// PATCH /api/budgets/:id
router.patch("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Budget ID must be a positive integer",
      });
    }

    const { amount } = req.body;

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) < 0
    ) {
      return res.status(400).json({
        error: "Budget amount must be a valid non-negative number",
      });
    }

    const result = await pool.query(
      `UPDATE budgets
       SET amount = $1
       WHERE id = $2
       RETURNING *`,
      [Number(amount), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Budget not found",
      });
    }

    res.json(normalizeBudget(result.rows[0]));
  } catch (error) {
    console.error("PATCH /api/budgets/:id:", error);
    res.status(500).json({
      error: "Failed to update budget",
    });
  }
});

// DELETE /api/budgets/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Budget ID must be a positive integer",
      });
    }

    const result = await pool.query(
      `DELETE FROM budgets
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Budget not found",
      });
    }

    res.json({
      message: "Budget deleted",
      budget: normalizeBudget(result.rows[0]),
    });
  } catch (error) {
    console.error("DELETE /api/budgets/:id:", error);
    res.status(500).json({
      error: "Failed to delete budget",
    });
  }
});

module.exports = router;
