const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2"); // 🔹 Agregamos mysql2
const plannerRoutes = require("./routes/planner");
const clientRoutes = require("./routes/clients");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Conexión a MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

connection.connect(err => {
  if (err) {
    console.error("❌ Error al conectar con MySQL:", err.message);
    return;
  }
  console.log("✅ Conectado a MySQL con éxito");

  // 🔹 Crear tablas si no existen
  const sql1 = `
    CREATE TABLE IF NOT EXISTS planner (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fecha VARCHAR(20),
      hora VARCHAR(20),
      formato VARCHAR(100),
      copy TEXT,
      link TEXT
    );
  `;
  const sql2 = `
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
  `;

  connection.query(sql1, err => {
    if (err) console.error("❌ Error creando tabla planner:", err);
  });
  connection.query(sql2, err => {
    if (err) console.error("❌ Error creando tabla clients:", err);
  });

  console.log("🧩 Tablas verificadas/creadas.");
});

// ✅ Rutas
app.get("/", (req, res) => {
  res.json({ message: "Planner API OK" });
});

app.use("/api/planner", plannerRoutes);
app.use("/api/clients", clientRoutes);

// ✅ Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
