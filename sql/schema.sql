-- ===============================================
-- 📘 BASE DE DATOS PLANNER APP
-- ===============================================

CREATE DATABASE IF NOT EXISTS planner_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE planner_db;

-- ===============================================
-- 🧱 TABLA: ADMINISTRADORES / USUARIOS
-- ===============================================
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 👥 TABLA: CLIENTES
-- ===============================================
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT,
  nombre VARCHAR(100) NOT NULL,
  pago_mensual DECIMAL(10,2) DEFAULT 0,
  pagado DECIMAL(10,2) DEFAULT 0,
  inicio_proyecto DATE,
  fin_proyecto DATE,
  prioridad ENUM('Baja','Media','Alta') DEFAULT 'Media',
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- ===============================================
-- 🗓️ TABLA: CONTENIDOS (CALENDARIO DE PUBLICACIONES)
-- ===============================================
CREATE TABLE IF NOT EXISTS contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora JSON NOT NULL,         -- Ejemplo: ["10:00", "12:00"]
  formato JSON NOT NULL,      -- Ejemplo: ["Reel", "Historia"]
  copy TEXT,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 💰 TABLA: PAGOS (REGISTRO DETALLADO)
-- ===============================================
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago DATE DEFAULT (CURRENT_DATE),
  metodo VARCHAR(50) DEFAULT 'Transferencia',
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- ===============================================
-- 😊 TABLA: MOOD TRACKER (ESTADO DE ÁNIMO DIARIO)
-- ===============================================
CREATE TABLE IF NOT EXISTS mood_tracker (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  mood INT NOT NULL,         -- Valor del 1 al 5
  energy INT NOT NULL,       -- Porcentaje de energía (0–100)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_mood (user_id, date),
  FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- ===============================================
-- 🧠 TABLA: TIMELINE / JOURNAL PERSONAL
-- ===============================================
CREATE TABLE IF NOT EXISTS timeline_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- ===============================================
-- 🔁 TABLA: HABIT TRACKER (HÁBITOS DIARIOS)
-- ===============================================
CREATE TABLE IF NOT EXISTS habits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  day DATE NOT NULL,
  completed BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_habit (user_id, day),
  FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- ===============================================
-- 🧩 TABLA: TAREAS PERSONALES (LISTA MUST/SHOULD/WANT)
-- ===============================================
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  categoria ENUM('Must','Should','Want') DEFAULT 'Should',
  titulo VARCHAR(255) NOT NULL,
  completada BOOLEAN DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- ===============================================
-- ✅ FIN DEL ESQUEMA
-- ===============================================
