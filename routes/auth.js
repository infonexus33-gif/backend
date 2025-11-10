const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "superclave";

// 🧾 REGISTRO DE NUEVO ADMIN
router.post("/register", async (req, res) => {
  const { nombre, password, role = "admin", plan = "Plus" } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: "Campos incompletos" });
  }

  try {
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
router.post("/login", (req, res) => {
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: "Faltan campos." });
  }

  const sql = "SELECT * FROM admins WHERE nombre = ?";
  db.query(sql, [nombre], async (err, results) => {
    try {
      if (err) {
        console.error("❌ Error en DB:", err);
        return res.status(500).json({ error: err.message });
      }

      if (!results.length) {
        console.warn("⚠️ Usuario no encontrado:", nombre);
        return res.status(401).json({ error: "Usuario no encontrado." });
      }

      const admin = results[0];
      const match = await bcrypt.compare(password, admin.password);

      if (!match) {
        console.warn("⚠️ Contraseña incorrecta para:", nombre);
        return res.status(401).json({ error: "Contraseña incorrecta." });
      }

      const token = jwt.sign(
        {
          id: admin.id,
          nombre: admin.nombre,
          role: admin.role,
          plan: admin.plan,
        },
        SECRET,
        { expiresIn: "12h" }
      );

      console.log("✅ Login exitoso de:", nombre);
      res.json({
        token,
        nombre: admin.nombre,
        role: admin.role,
        plan: admin.plan,
      });
    } catch (error) {
      console.error("💥 Error inesperado en login:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
});

module.exports = router;
