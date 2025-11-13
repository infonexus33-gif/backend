const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getDB } = require("../db");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT * FROM admins WHERE username=?", [username]);

    if (rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(403).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
