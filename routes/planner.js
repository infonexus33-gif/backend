const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener todos los contenidos
router.get("/", (req, res) => {
  const sql = "SELECT * FROM contents ORDER BY fecha, id";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Crear nuevo contenido
router.post("/", (req, res) => {
  const { fecha, hora, formato, copy, link } = req.body;
  if (!fecha || !hora || !formato)
    return res.status(400).json({ error: "Campos incompletos" });

  const sql = "INSERT INTO contents (fecha, hora, formato, copy, link) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [fecha, hora, formato, copy || "", link || ""], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, message: "Contenido guardado correctamente" });
  });
});

// ✅ Editar contenido existente
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { fecha, hora, formato, copy, link } = req.body;
  const sql = "UPDATE contents SET fecha=?, hora=?, formato=?, copy=?, link=? WHERE id=?";
  db.query(sql, [fecha, hora, formato, copy, link, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Contenido actualizado correctamente" });
  });
});

// ✅ Eliminar contenido
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM contents WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Contenido eliminado correctamente" });
  });
});

module.exports = router;
