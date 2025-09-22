// src/database/connection.js
const mysql = require("mysql2/promise");
require("dotenv").config();

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "university_db",
      });
      console.log("Conexão com o banco de dados estabelecida");
    } catch (error) {
      console.error("Erro ao conectar com o banco de dados:", error);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.connection.execute(sql, params);
      return rows;
    } catch (error) {
      console.error("Erro na consulta:", error);
      throw error;
    }
  }
}

module.exports = new Database();
