const mysql = require("mysql2/promise");
require("dotenv").config();

let db;
let isConnecting = false;

async function connectWithRetry(retries = 5, delay = 3000) {
  if (isConnecting) return db; // evita conexiones paralelas
  isConnecting = true;

  for (let i = 0; i < retries; i++) {
    try {
      db = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      const conn = await db.getConnection();
      console.log("✅ Conectado correctamente a MySQL (pool activo)");
      conn.release();

      // Escucha errores del pool y se reconecta automáticamente
      db.on("error", async (err) => {
        console.error("⚠️ Error de conexión MySQL detectado:", err.message);
        if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
          console.log("🔁 Intentando reconexión automática a MySQL...");
          await connectWithRetry();
        }
      });

      isConnecting = false;
      return db;
    } catch (err) {
      console.error(`❌ Error conectando a MySQL (intento ${i + 1}):`, err.message);
      if (i < retries - 1) {
        console.log(`🔄 Reintentando en ${delay / 1000} segundos...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error("🚨 No se pudo conectar a la base de datos después de varios intentos.");
        process.exit(1);
      }
    }
  }
}

async function getDB() {
  if (!db) {
    await connectWithRetry();
  }
  return db;
}

module.exports = { connectWithRetry, getDB };
