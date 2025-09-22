const mysql = require("mysql2/promise");
require("dotenv").config();

async function setupDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "university_user",
      password: process.env.DB_PASSWORD || "university_pass",
      database: process.env.DB_NAME || "university_db",
    });

    console.log("🗄️  Criando estrutura do banco de dados...");

    // Criar tabelas
    const tables = [
      `CREATE TABLE IF NOT EXISTS DEPARTMENT (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL
            )`,

      `CREATE TABLE IF NOT EXISTS TITLE (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL
            )`,

      `CREATE TABLE IF NOT EXISTS PROFESSOR (
                id INT PRIMARY KEY AUTO_INCREMENT,
                department_id INT,
                title_id INT,
                name VARCHAR(255),
                FOREIGN KEY (department_id) REFERENCES DEPARTMENT(id),
                FOREIGN KEY (title_id) REFERENCES TITLE(id)
            )`,

      `CREATE TABLE IF NOT EXISTS BUILDING (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL
            )`,

      `CREATE TABLE IF NOT EXISTS ROOM (
                id INT PRIMARY KEY AUTO_INCREMENT,
                building_id INT,
                number VARCHAR(20),
                capacity INT,
                FOREIGN KEY (building_id) REFERENCES BUILDING(id)
            )`,

      `CREATE TABLE IF NOT EXISTS SUBJECT (
                id INT PRIMARY KEY AUTO_INCREMENT,
                subject_id VARCHAR(20) UNIQUE,
                code VARCHAR(20),
                name VARCHAR(255) NOT NULL,
                credits INT DEFAULT 4
            )`,

      `CREATE TABLE IF NOT EXISTS SUBJECT_PREREQUISITE (
                id INT PRIMARY KEY AUTO_INCREMENT,
                subject_id INT,
                prerequisite_id INT,
                FOREIGN KEY (subject_id) REFERENCES SUBJECT(id),
                FOREIGN KEY (prerequisite_id) REFERENCES SUBJECT(id)
            )`,

      `CREATE TABLE IF NOT EXISTS CLASS (
                id INT PRIMARY KEY AUTO_INCREMENT,
                subject_id INT,
                year INT,
                semester INT,
                code VARCHAR(20),
                professor_id INT,
                FOREIGN KEY (subject_id) REFERENCES SUBJECT(id),
                FOREIGN KEY (professor_id) REFERENCES PROFESSOR(id)
            )`,

      `CREATE TABLE IF NOT EXISTS CLASS_SCHEDULE (
                id INT PRIMARY KEY AUTO_INCREMENT,
                class_id INT,
                room_id INT,
                day_of_week INT,
                start_time TIME,
                end_time TIME,
                FOREIGN KEY (class_id) REFERENCES CLASS(id),
                FOREIGN KEY (room_id) REFERENCES ROOM(id)
            )`,
    ];

    for (const table of tables) {
      await connection.execute(table);
    }

    console.log("✅ Estrutura do banco de dados criada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar estrutura do banco:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
