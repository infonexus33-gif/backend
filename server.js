// ==============================================
// 🌐 DEPENDENCIAS Y CONFIGURACIÓN
// ==============================================
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");

// 🔹 Rutas
const plannerRoutes = require("./routes/planner");
const clientRoutes = require("./routes/clients");
const wellnessRoutes = require("./routes/wellness");
const authRoutes = require("./routes/auth");

dotenv.config();
const app = express();

// ==============================================
// ⚙️ CONFIGURACIÓN CORS (completamente abierta para depurar)
// ==============================================
const allowedOrigins = [
  "https://pipiplanner.netlify.app",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Log de depuración de requests
app.use((req, res, next) => {
  console.log(`🛰️ ${req.method} ${req.url} desde ${req.headers.origin}`);
  next();
});

// ==============================================
// 🧩 CREAR TABLAS SI NO EXISTEN
// ==============================================
async function initTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS planner (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fecha VARCHAR(20),
        hora VARCHAR(20),
        formato VARCHAR(100),
        copy TEXT,
        link TEXT
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        pago_mensual DECIMAL(10,2),
        pagado DECIMAL(10,2),
        inicio_proyecto DATE,
        fin_proyecto DATE,
        prioridad ENUM('Baja','Media','Alta'),
        descripcion TEXT
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS mood_tracker (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        date DATE NOT NULL,
        mood INT NOT NULL,
        energy INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_mood (user_id, date)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS timeline_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        content TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        day DATE NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_habit (user_id, day)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        categoria ENUM('Must','Should','Want') DEFAULT 'Should',
        titulo VARCHAR(255) NOT NULL,
        completada BOOLEAN DEFAULT 0,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("🧱 Tablas verificadas o creadas correctamente.");
  } catch (err) {
    console.error("❌ Error creando tablas:", err.message);
  }
}

initTables();

// ==============================================
// 🚀 RUTAS PRINCIPALES
// ==============================================
app.get("/", (req, res) => {
  res.json({ message: "Planner API funcionando correctamente 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/wellness", wellnessRoutes);

// ==============================================
// 🧨 MANEJO GLOBAL DE ERRORES
// ==============================================
app.use((err, req, res, next) => {
  console.error("❌ Error interno:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// ==============================================
// 🔥 INICIAR SERVIDOR
// ==============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
