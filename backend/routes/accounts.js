
const express = require("express");
const router = express.Router();

const pool = require("../db");
const { parseId } = require("../utils/validation");

function normalizeAccount(row) {
  return {
    ...row,
    balance: Number(row.balance),
  };
}

// GET /api/accounts
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, type, balance, created_at
      FROM accounts
      ORDER BY name ASC
    `);

    res.json(result.rows.map(normalizeAccount));
  } catch (error) {
    console.error("GET /api/accounts:", error);
    res.status(500).json({
      error: "Failed to retrieve accounts",
    });
  }
});

// POST /api/accounts
router.post("/", async (req, res) => {
  try {
    const { name, type, balance } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        error: "Account name is required",
      });
    }

    if (!["asset", "liability"].includes(type)) {
      return res.status(400).json({
        error: "Account type must be asset or liability",
      });
    }

    if (
      balance === undefined ||
      balance === null ||
      balance === "" ||
      !Number.isFinite(Number(balance)) ||
      Number(balance) < 0
    ) {
      return res.status(400).json({
        error: "Account balance must be a valid non-negative number",
      });
    }

    const result = await pool.query(
      `INSERT INTO accounts (name, type, balance)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), type, Number(balance)]
    );

    res.status(201).json(normalizeAccount(result.rows[0]));
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "An account with this name already exists",
      });
    }

    console.error("POST /api/accounts:", error);
    res.status(500).json({
      error: "Failed to create account",
    });
  }
});

// PATCH /api/accounts/:id
// The current frontend uses this endpoint to update the balance.
router.patch("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Account ID must be a positive integer",
      });
    }

    const { balance } = req.body;

    if (
      balance === undefined ||
      balance === null ||
      balance === "" ||
      !Number.isFinite(Number(balance)) ||
      Number(balance) < 0
    ) {
      return res.status(400).json({
        error: "Account balance must be a valid non-negative number",
      });
    }

    const result = await pool.query(
      `UPDATE accounts
       SET balance = $1
       WHERE id = $2
       RETURNING *`,
      [Number(balance), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Account not found",
      });
    }

    res.json(normalizeAccount(result.rows[0]));
  } catch (error) {
    console.error("PATCH /api/accounts/:id:", error);
    res.status(500).json({
      error: "Failed to update account",
    });
  }
});

// DELETE /api/accounts/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Account ID must be a positive integer",
      });
    }

    const result = await pool.query(
      `DELETE FROM accounts
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Account not found",
      });
    }

    res.json({
      message: "Account deleted",
      account: normalizeAccount(result.rows[0]),
    });
  } catch (error) {
    console.error("DELETE /api/accounts/:id:", error);
    res.status(500).json({
      error: "Failed to delete account",
    });
  }
});

module.exports = router;
