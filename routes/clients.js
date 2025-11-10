const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT * FROM clients ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error en /clients:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { nombre, pago_mensual, pagado, inicio_proyecto, fin_proyecto, prioridad, descripcion } = req.body;

  try {
    const db = await getDB();
    const sql = `
      INSERT INTO clients (nombre, pago_mensual, pagado, inicio_proyecto, fin_proyecto, prioridad, descripcion)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [nombre, pago_mensual, pagado, inicio_proyecto, fin_proyecto, prioridad, descripcion]);
    res.json({ message: "Cliente agregado correctamente ✅" });
  } catch (err) {
    console.error("❌ Error insertando cliente:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
