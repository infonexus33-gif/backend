CREATE DATABASE IF NOT EXISTS planner_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE planner_db;

CREATE TABLE IF NOT EXISTS contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora JSON NOT NULL,
  formato JSON NOT NULL,
  copy TEXT,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  pago_mensual DECIMAL(10,2) DEFAULT 0,
  pagado DECIMAL(10,2) DEFAULT 0,
  inicio_proyecto DATE,
  fin_proyecto DATE,
  prioridad ENUM('Baja','Media','Alta') DEFAULT 'Media',
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
