const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "wallance2025clavesegura";

// ==================================================
// 🧾 REGISTRO (solo para crear nuevos admins manualmente)
// ==================================================
router.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password)
    return res.status(400).json({ error: "Campos incompletos" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO usuarios (username, password, role, plan) VALUES (?, ?, 'admin', 'Plus')";
    db.query(sql, [email, hashed], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Administrador registrado correctamente" });
    });
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==================================================
// 🔐 LOGIN
// ==================================================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Faltan campos requeridos" });

  const sql = "SELECT * FROM usuarios WHERE username = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length)
      return res.status(401).json({ error: "Usuario no encontrado" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        plan: user.plan,
      },
      SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token,
      username: user.username,
      role: user.role,
      plan: user.plan,
    });
  });
});

// ==================================================
// 🧠 VERIFICAR TOKEN (mantener sesión activa)
// ==================================================
router.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Falta token de autenticación" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: "Token inválido o expirado" });
  }
});

module.exports = router;
