const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

// =======================
// 📌 GET — TODOS LOS CONTENIDOS DEL USUARIO
// =======================
router.get("/", async (req, res) => {
  try {
    const userId = req.admin.id;
    const db = await getDB();

    const [rows] = await db.query(
      "SELECT * FROM planner WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error en GET /planner:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 📌 POST — AGREGAR CONTENIDO
// =======================
router.post("/", async (req, res) => {
  const userId = req.admin.id;
  const { fecha, hora, formato, copy, link } = req.body;

  try {
    const db = await getDB();
    await db.query(
      `
      INSERT INTO planner (fecha, hora, formato, copy, link, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        fecha,
        JSON.stringify(hora),
        JSON.stringify(formato),
        copy,
        link,
        userId
      ]
    );

    res.json({ message: "Contenido guardado" });
  } catch (err) {
    console.error("❌ Error en POST /planner:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 📌 DELETE — BORRAR CONTENIDO
// =======================
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.admin.id;
    const id = req.params.id;

    const db = await getDB();
    await db.query("DELETE FROM planner WHERE id = ? AND user_id = ?", [id, userId]);

    res.json({ message: "Eliminado" });
  } catch (err) {
    console.error("❌ Error en DELETE /planner:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
