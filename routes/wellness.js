const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

// =======================
// 🎭 MOOD TRACKER
// =======================
router.post("/mood", async (req, res) => {
  const { mood, energy } = req.body;
  const userId = req.admin.id;

  try {
    const db = await getDB();

    await db.query(
      `INSERT INTO mood_tracker (date, mood, energy, user_id)
       VALUES (CURDATE(), ?, ?, ?)
       ON DUPLICATE KEY UPDATE mood = VALUES(mood), energy = VALUES(energy)`,
      [mood, energy, userId]
    );

    res.json({ message: "Estado guardado" });
  } catch (e) {
    console.error("❌ Error en /mood:", e);
    res.status(500).json({ error: e.message });
  }
});

// =======================
// 📌 TIMELINE
// =======================
router.post("/timeline", async (req, res) => {
  const { content } = req.body;
  const userId = req.admin.id;

  try {
    const db = await getDB();
    await db.query(
      "INSERT INTO timeline_entries (content, date, user_id) VALUES (?, NOW(), ?)",
      [content, userId]
    );

    res.json({ message: "Entrada agregada" });
  } catch (e) {
    console.error("❌ Error en /timeline:", e);
    res.status(500).json({ error: e.message });
  }
});

// =======================
// 🧩 TASKS
// =======================
router.post("/tasks", async (req, res) => {
  const { categoria, titulo } = req.body;
  const userId = req.admin.id;

  try {
    const db = await getDB();
    await db.query(
      "INSERT INTO tasks (categoria, titulo, user_id) VALUES (?, ?, ?)",
      [categoria, titulo, userId]
    );

    res.json({ message: "Tarea agregada" });
  } catch (e) {
    console.error("❌ Error en /tasks:", e);
    res.status(500).json({ error: e.message });
  }
});

// =======================
// 🔁 HABITS
// =======================
router.post("/habits", async (req, res) => {
  const { day, completed } = req.body;
  const userId = req.admin.id;

  try {
    const db = await getDB();

    await db.query(
      `
      INSERT INTO habits (day, completed, user_id)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE completed = VALUES(completed)
    `,
      [day, completed, userId]
    );

    res.json({ message: "Hábito actualizado" });
  } catch (e) {
    console.error("❌ Error en /habits:", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
