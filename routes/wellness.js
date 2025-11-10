const express = require("express");
const router = express.Router();
const db = require("../db");

// === MOOD TRACKER ===
router.post("/mood", async (req, res) => {
  const { user_id = 1, date, mood, energy } = req.body;
  try {
    await db.query(
      "INSERT INTO mood_tracker (user_id, date, mood, energy) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE mood=?, energy=?",
      [user_id, date, mood, energy, mood, energy]
    );
    res.json({ success: true, message: "Estado de ánimo registrado." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === TIMELINE ===
router.post("/timeline", async (req, res) => {
  const { user_id = 1, content } = req.body;
  try {
    await db.query("INSERT INTO timeline_entries (user_id, content) VALUES (?, ?)", [user_id, content]);
    res.json({ success: true, message: "Entrada agregada al timeline." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/timeline", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM timeline_entries ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === HABIT TRACKER ===
router.post("/habits", async (req, res) => {
  const { user_id = 1, day, completed } = req.body;
  try {
    await db.query(
      "INSERT INTO habits (user_id, day, completed) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE completed=?",
      [user_id, day, completed, completed]
    );
    res.json({ success: true, message: "Hábito actualizado." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === LISTA DE TAREAS ===
router.post("/tasks", async (req, res) => {
  const { user_id = 1, categoria, titulo } = req.body;
  try {
    await db.query("INSERT INTO tasks (user_id, categoria, titulo) VALUES (?, ?, ?)", [user_id, categoria, titulo]);
    res.json({ success: true, message: "Tarea agregada." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tasks", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tasks ORDER BY fecha_creacion DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/tasks/:id", async (req, res) => {
  const { completada } = req.body;
  try {
    await db.query("UPDATE tasks SET completada=? WHERE id=?", [completada, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
