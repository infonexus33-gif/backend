const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT * FROM planner ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error en /planner:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { fecha, hora, formato, copy, link } = req.body;

  try {
    const db = await getDB();
    const sql = `
      INSERT INTO planner (fecha, hora, formato, copy, link)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(sql, [fecha, hora, formato, copy, link]);
    res.json({ message: "Tarea agregada correctamente ✅" });
  } catch (err) {
    console.error("❌ Error insertando planner:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
