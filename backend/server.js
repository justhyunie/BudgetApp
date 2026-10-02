const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { Pool } = require("pg");
const fs = require("fs");

const app = express();
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

const port = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use(helmet());

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later."
  }
});

app.use("/api/", apiLimiter);

function parseTaskId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

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

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve tasks"
    });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (typeof title !== "string") {
      return res.status(400).json({
        error: "Task title must be a string"
      });
    }

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return res.status(400).json({
        error: "Task title is required"
      });
    }

    if (trimmedTitle.length > 200) {
      return res.status(400).json({
        error: "Task title must be 200 characters or fewer"
      });
    }

    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [trimmedTitle]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create task"
    });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const taskId = parseTaskId(id);

    if (taskId === null) {
      return res.status(400).json({
        error: "Task ID must be a positive integer"
      });
    }

    if (typeof completed !== "boolean") {
      return res.status(400).json({
        error: "completed must be true or false"
      });
    }

    const result = await pool.query(
      "UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *",
      [completed, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update task"
    });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const taskId = parseTaskId(id);

    if (taskId === null) {
      return res.status(400).json({
        error: "Task ID must be a positive integer"
      });
    }

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    res.json({
      message: "Task deleted",
      task: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete task"
    });
  }
});

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  res.status(500).json({
    error: "Internal server error"
  });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
