const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

// =======================
// 📌 GET — TODOS LOS CLIENTES DEL USUARIO
// =======================
router.get("/", async (req, res) => {
  try {
    const userId = req.admin.id;

    const db = await getDB();
    const [rows] = await db.query(
      "SELECT * FROM clients WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error en GET /clients:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 📌 POST — CREAR CLIENTE
// =======================
router.post("/", async (req, res) => {
  const userId = req.admin.id;
  const { nombre, pago_mensual, pagado, inicio_proyecto, fin_proyecto, prioridad, descripcion } = req.body;

  try {
    const db = await getDB();
    const sql = `
      INSERT INTO clients (nombre, pago_mensual, pagado, inicio_proyecto, fin_proyecto, prioridad, descripcion, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      nombre,
      pago_mensual,
      pagado,
      inicio_proyecto,
      fin_proyecto,
      prioridad,
      descripcion,
      userId
    ]);

    res.json({ message: "Cliente agregado correctamente ✅" });
  } catch (err) {
    console.error("❌ Error insertando cliente:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 📌 PUT — EDITAR CLIENTE
// =======================
router.put("/:id", async (req, res) => {
  try {
    const userId = req.admin.id;
    const id = req.params.id;

    const { nombre, pago_mensual, pagado, inicio_proyecto, fin_proyecto, prioridad, descripcion } = req.body;

    const db = await getDB();
    const sql = `
      UPDATE clients SET nombre=?, pago_mensual=?, pagado=?, inicio_proyecto=?, fin_proyecto=?, prioridad=?, descripcion=?
      WHERE id=? AND user_id=?
    `;

    await db.query(sql, [
      nombre, pago_mensual, pagado, inicio_proyecto, fin_proyecto, prioridad, descripcion,
      id, userId
    ]);

    res.json({ message: "Cliente actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 📌 DELETE — BORRAR CLIENTE
// =======================
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.admin.id;
    const id = req.params.id;

    const db = await getDB();
    await db.query("DELETE FROM clients WHERE id = ? AND user_id = ?", [id, userId]);

    res.json({ message: "Cliente eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 📌 TOTAL MENSUAL
// =======================
router.get("/total/:year/:month", async (req, res) => {
  const userId = req.admin.id;
  const { year, month } = req.params;

  try {
    const db = await getDB();
    const [rows] = await db.query(
      `
      SELECT SUM(pagado) AS total_mes
      FROM clients
      WHERE user_id = ?
      AND YEAR(inicio_proyecto) = ?
      AND MONTH(inicio_proyecto) = ?
      `,
      [userId, year, month]
    );

    res.json({ total_mes: rows[0]?.total_mes || 0 });
  } catch (err) {
    console.error("❌ Error en /clients/total:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
