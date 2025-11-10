const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "superclave";

// 🧾 REGISTRO DE NUEVO ADMIN
router.post("/register", async (req, res) => {
  const { username, password, role = "admin", plan = "Plus" } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Campos incompletos" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO usuarios (username, password, role, plan) VALUES (?, ?, ?, ?)";
    await db.query(sql, [username, hashed, role, plan]);
    res.json({ message: "Administrador registrado correctamente ✅" });
  } catch (err) {
    console.error("❌ Error registrando admin:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔐 LOGIN ADMIN
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Faltan campos." });

  const sql = "SELECT * FROM usuarios WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length)
      return res.status(401).json({ error: "Usuario no encontrado." });

    const admin = results[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(401).json({ error: "Contraseña incorrecta." });

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role, plan: admin.plan },
      SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token, nombre: admin.username, plan: admin.plan });
  });
});

module.exports = router;
