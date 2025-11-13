// ==============================================
// 📌 IMPORTS
// ==============================================
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { connectWithRetry, getDB } = require("./db");
const verificarToken = require("./middleware/authentication");

const plannerRoutes = require("./routes/planner");
const clientRoutes = require("./routes/clients");
const wellnessRoutes = require("./routes/wellness");
const authRoutes = require("./routes/auth");

// ==============================================
// 📌 CONFIGURACIÓN GENERAL
// ==============================================
dotenv.config();
const app = express();

// ==============================================
// 🔐 CORS (Netlify + Localhost)
// ==============================================
app.use(
  cors({
    origin: [
      "https://pipiplanner.netlify.app",
      "http://localhost:5500",
      "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ==============================================
// 🔧 PARSEO DE REQUESTS
// ==============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================================
// 🛰️ LOG DE REQUESTS (DEBUG)
// ==============================================
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

// ==============================================
// 🚀 INICIAR CONEXIÓN MYSQL
// ==============================================
async function startServer() {
  try {
    await connectWithRetry();
    const db = await getDB();
    global.db = db;

    console.log("🔌 Conexión MySQL lista.");

    // ==========================================
    // 🌍 Rutas públicas
    // ==========================================
    app.get("/", (req, res) => {
      res.json({ message: "🚀 Planner API funcionando correctamente" });
    });

    app.use("/api/auth", authRoutes);

    // ==========================================
    // 🔒 Rutas protegidas con JWT
    // ==========================================
    app.use("/api/planner", verificarToken, plannerRoutes);
    app.use("/api/clients", verificarToken, clientRoutes);
    app.use("/api/wellness", verificarToken, wellnessRoutes);

    // ==========================================
    // ❌ Manejo de errores global
    // ==========================================
    app.use((err, req, res, next) => {
      console.error("💥 ERROR INTERNO:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    });

    // ==========================================
    // 🔥 Iniciar servidor
    // ==========================================
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
    });

    // ==========================================
    // 💤 Mantener viva la conexión MySQL
    // ==========================================
    setInterval(async () => {
      try {
        await db.query("SELECT 1");
        console.log("💤 Keep-alive OK");
      } catch (err) {
        console.error("⚠️ Error en keep-alive:", err.message);
      }
    }, 5 * 60 * 1000);

  } catch (err) {
    console.error("💥 ERROR CRÍTICO:", err.message);
    process.exit(1);
  }
}

// Ejecutar
startServer();
