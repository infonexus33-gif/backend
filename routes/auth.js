const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "superclave";

// 🧾 REGISTRO
router.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: "Campos incompletos" });

  const hashed = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO admins (nombre, email, password) VALUES (?, ?, ?)";
  db.query(sql, [nombre, email, hashed], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Administrador registrado correctamente" });
  });
});

// 🔐 LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM admins WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(401).json({ error: "Usuario no encontrado" });

    const admin = results[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: admin.id, nombre: admin.nombre }, SECRET, { expiresIn: "12h" });
    res.json({ token, nombre: admin.nombre });
  });
});

module.exports = router;
