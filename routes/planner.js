const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener todos los contenidos
router.get("/", (req, res) => {
  const sql = "SELECT * FROM contents ORDER BY fecha, id";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // Parsear JSON de hora y formato
    const data = results.map(r => ({
      ...r,
      hora: JSON.parse(r.hora || "[]"),
      formato: JSON.parse(r.formato || "[]")
    }));
    res.json(data);
  });
});

// Crear nuevo contenido
router.post("/", (req, res) => {
  const { fecha, hora, formato, copy, link } = req.body;
  if (!fecha) return res.status(400).json({ error: "La fecha es obligatoria" });
  if (!hora || !hora.length) return res.status(400).json({ error: "Seleccioná al menos un horario" });
  if (!formato || !formato.length) return res.status(400).json({ error: "Seleccioná al menos un formato" });

  const sql = "INSERT INTO contents (fecha, hora, formato, copy, link) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [fecha, JSON.stringify(hora), JSON.stringify(formato), copy || "", link || ""],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, message: "Contenido guardado correctamente" });
    }
  );
});

module.exports = router;
