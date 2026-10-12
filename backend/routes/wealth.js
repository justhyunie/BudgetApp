const express = require("express");
const router = express.Router();

const pool = require("../db");

function normalizeWealth(row) {
  return {
    ...row,
    net_worth: Number(row.net_worth)
  };
}

/*
|--------------------------------------------------------------------------
| GET WEALTH HISTORY
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
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

    res.json(
      result.rows.map(normalizeWealth)
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve wealth history"
    });
  }
});

/*
|--------------------------------------------------------------------------
| CREATE WEALTH HISTORY ENTRY
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {
  try {
    const {
      date,
      net_worth
    } = req.body;

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
      [
        date,
        numericNetWorth
      ]
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

module.exports = router;