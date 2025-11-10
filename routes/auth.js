const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../db");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "superclave";

// 🧾 REGISTRO DE NUEVO USUARIO
router.post("/register", async (req, res) => {
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: "Campos incompletos" });
  }

  try {
    const db = await getDB();
    const [exists] = await db.query("SELECT * FROM admins WHERE nombre = ?", [nombre]);

    if (exists.length > 0) {
      return res.status(409).json({ error: "El usuario ya existe." });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO admins (nombre, password) VALUES (?, ?)", [nombre, hashed]);

    res.json({ success: true, message: "Usuario registrado correctamente ✅" });
  } catch (err) {
    console.error("❌ Error en /register:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔐 LOGIN USUARIO
router.post("/login", async (req, res) => {
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: "Faltan campos." });
  }

  try {
    const db = await getDB();
    const [results] = await db.query("SELECT * FROM admins WHERE nombre = ?", [nombre]);

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado." });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    const token = jwt.sign({ id: user.id, nombre: user.nombre }, SECRET, { expiresIn: "12h" });

    res.json({
      success: true,
      token,
      nombre: user.nombre,
    });
  } catch (err) {
    console.error("❌ Error en /login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
