const mysql = require("mysql2/promise");

async function waitForDatabase() {
  const maxRetries = 30;
  const delay = 2000; // 2 segundos

  for (let i = 0; i < maxRetries; i++) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "university_user",
        password: process.env.DB_PASSWORD || "university_pass",
        database: process.env.DB_NAME || "university_db",
      });

      await connection.execute("SELECT 1");
      await connection.end();

      console.log("✅ Conexão com banco de dados estabelecida!");
      return;
    } catch (error) {
      console.log(
        `⏳ Aguardando banco de dados... (tentativa ${i + 1}/${maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.error("❌ Não foi possível conectar ao banco de dados");
  process.exit(1);
}

waitForDatabase();
