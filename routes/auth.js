const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../db");

const SECRET = process.env.JWT_SECRET || "superclave";

// LOGIN
router.post("/login", async (req, res) => {
  const { nombre, password } = req.body;

  try {
    const db = await getDB();

    // 🔥 CAMBIO IMPORTANTE:
    // Antes estaba:
    // SELECT * FROM admins WHERE username = ?
    // Pero tu tabla tiene "nombre"
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE nombre = ?",
      [nombre]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = rows[0];

    // Verificar password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Crear token
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
