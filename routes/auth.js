const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../db");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "superclave";

// 🧾 REGISTRO DE NUEVO ADMIN
router.post("/register", async (req, res) => {
  const { nombre, password, role = "admin", plan = "Plus" } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: "Campos incompletos" });
  }

  try {
    const db = await getDB();

    const hashed = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO admins (nombre, password, role, plan) VALUES (?, ?, ?, ?)";

    await db.query(sql, [nombre, hashed, role, plan]);
    res.json({ message: "Administrador registrado correctamente ✅" });
  } catch (err) {
    console.error("❌ Error registrando admin:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔐 LOGIN ADMIN
router.post("/login", async (req, res) => {
  const { nombre, username, password } = req.body;
  const userField = username || nombre;

  if (!userField || !password) {
    return res.status(400).json({ error: "Faltan campos." });
  }

  try {
    const db = await getDB();

    const [results] = await db.query(
      "SELECT * FROM admins WHERE nombre = ? OR username = ?",
      [userField, userField]
    );

    if (!results.length) {
      return res.status(401).json({ error: "Usuario no encontrado." });
    }

    const admin = results[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    const token = jwt.sign(
      { id: admin.id, nombre: admin.nombre, role: admin.role, plan: admin.plan },
      SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token,
      nombre: admin.nombre,
      role: admin.role,
      plan: admin.plan,
    });
  } catch (err) {
    console.error("❌ Error en /login:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
