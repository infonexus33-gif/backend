const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener todos los clientes
router.get("/", (req, res) => {
  const sql = "SELECT * FROM clients ORDER BY FIELD(prioridad, 'Alta','Media','Baja'), nombre ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Crear cliente
router.post("/", (req, res) => {
  const { nombre, pago_mensual, pagado, inicio_proyecto, fin_proyecto, prioridad, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

  const sql = `INSERT INTO clients 
    (nombre, pago_mensual, pagado, inicio_proyecto, fin_proyecto, prioridad, descripcion)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [
      nombre,
      pago_mensual || 0,
      pagado || 0,
      inicio_proyecto || null,
      fin_proyecto || null,
      prioridad || "Media",
      descripcion || ""
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, message: "Cliente agregado correctamente" });
    }
  );
});

// Editar cliente
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, pago_mensual, pagado, inicio_proyecto, fin_proyecto, prioridad, descripcion } = req.body;

  const sql = `UPDATE clients SET 
    nombre = ?, 
    pago_mensual = ?, 
    pagado = ?, 
    inicio_proyecto = ?, 
    fin_proyecto = ?, 
    prioridad = ?, 
    descripcion = ?
    WHERE id = ?`;

  db.query(
    sql,
    [
      nombre,
      pago_mensual || 0,
      pagado || 0,
      inicio_proyecto || null,
      fin_proyecto || null,
      prioridad || "Media",
      descripcion || "",
      id
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Cliente actualizado" });
    }
  );
});

// Eliminar cliente
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM clients WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Cliente eliminado" });
  });
});

// ✅ Total pagado por mes (según columna 'pagado')
router.get("/total/:year/:month", (req, res) => {
  const { year, month } = req.params;
  const sql = `
    SELECT SUM(pagado) AS total_mes
    FROM clients
    WHERE YEAR(NOW()) = ? AND MONTH(NOW()) = ?
  `;
  db.query(sql, [year, month], (err, result) => {
    if (err) {
      console.error("Error al calcular total mensual:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ total_mes: result[0].total_mes || 0 });
  });
});


module.exports = router;
