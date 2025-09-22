const mysql = require("mysql2/promise");
require("dotenv").config();

async function seedDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "university_user",
      password: process.env.DB_PASSWORD || "university_pass",
      database: process.env.DB_NAME || "university_db",
    });

    console.log("🌱 Inserindo dados de exemplo...");

    // Verificar se já existem dados
    const [existingData] = await connection.execute(
      "SELECT COUNT(*) as count FROM DEPARTMENT",
    );
    if (existingData[0].count > 0) {
      console.log("ℹ️  Dados já existem no banco. Pulando seed...");
      return;
    }

    // Inserir dados de exemplo
    const seedQueries = [
      // Departamentos
      `INSERT INTO DEPARTMENT (name) VALUES 
                ('Ciência da Computação'),
                ('Matemática'),
                ('Física'),
                ('Engenharia'),
                ('Administração')`,

      // Títulos
      `INSERT INTO TITLE (name) VALUES 
                ('Doutor'),
                ('Mestre'),
                ('Especialista'),
                ('Bacharel')`,

      // Professores
      `INSERT INTO PROFESSOR (department_id, title_id, name) VALUES 
                (1, 1, 'Prof. Dr. João Silva'),
                (1, 2, 'Prof. MSc. Maria Santos'),
                (2, 1, 'Prof. Dr. Carlos Lima'),
                (3, 2, 'Prof. MSc. Ana Costa'),
                (4, 1, 'Prof. Dr. Pedro Souza'),
                (5, 3, 'Prof. Esp. Lucia Ferreira')`,

      // Prédios
      `INSERT INTO BUILDING (name) VALUES 
                ('Prédio Central'),
                ('Laboratórios'),
                ('Anexo A'),
                ('Biblioteca')`,

      // Salas
      `INSERT INTO ROOM (building_id, number, capacity) VALUES 
                (1, '101', 50),
                (1, '102', 45),
                (1, '201', 60),
                (2, 'Lab-01', 30),
                (2, 'Lab-02', 25),
                (3, 'A-01', 40),
                (3, 'A-02', 35),
                (4, 'Aud-01', 200)`,

      // Disciplinas
      `INSERT INTO SUBJECT (subject_id, code, name, credits) VALUES 
                ('CC001', 'ALG001', 'Algoritmos I', 4),
                ('CC002', 'BD001', 'Banco de Dados', 4),
                ('CC003', 'POO001', 'Programação Orientada a Objetos', 6),
                ('MAT001', 'CALC001', 'Cálculo I', 6),
                ('MAT002', 'CALC002', 'Cálculo II', 6),
                ('FIS001', 'FIS001', 'Física I', 4),
                ('ENG001', 'EST001', 'Estruturas', 4),
                ('ADM001', 'CONT001', 'Contabilidade', 4)`,

      // Pré-requisitos
      `INSERT INTO SUBJECT_PREREQUISITE (subject_id, prerequisite_id) VALUES 
                (2, 1),
                (3, 1),
                (5, 4)`,

      // Turmas
      `INSERT INTO CLASS (subject_id, year, semester, code, professor_id) VALUES 
                (1, 2024, 1, 'ALG001-T01', 1),
                (1, 2024, 1, 'ALG001-T02', 2),
                (2, 2024, 1, 'BD001-T01', 2),
                (3, 2024, 1, 'POO001-T01', 1),
                (4, 2024, 1, 'CALC001-T01', 3),
                (6, 2024, 1, 'FIS001-T01', 4),
                (7, 2024, 1, 'EST001-T01', 5),
                (8, 2024, 1, 'CONT001-T01', 6)`,

      // Horários das turmas
      `INSERT INTO CLASS_SCHEDULE (class_id, room_id, day_of_week, start_time, end_time) VALUES 
                (1, 1, 2, '08:00:00', '10:00:00'),
                (1, 1, 4, '08:00:00', '10:00:00'),
                (2, 2, 2, '10:00:00', '12:00:00'),
                (2, 2, 4, '10:00:00', '12:00:00'),
                (3, 4, 3, '14:00:00', '16:00:00'),
                (3, 4, 5, '14:00:00', '16:00:00'),
                (4, 5, 2, '14:00:00', '17:00:00'),
                (5, 3, 3, '08:00:00', '11:00:00'),
                (5, 3, 5, '08:00:00', '11:00:00'),
                (6, 6, 2, '16:00:00', '18:00:00'),
                (6, 6, 4, '16:00:00', '18:00:00'),
                (7, 7, 3, '19:00:00', '21:00:00'),
                (8, 8, 6, '08:00:00', '12:00:00')`,
    ];

    for (const query of seedQueries) {
      await connection.execute(query);
    }

    console.log("✅ Dados de exemplo inseridos com sucesso!");

    // Mostrar estatísticas
    const stats = await Promise.all([
      connection.execute("SELECT COUNT(*) as count FROM PROFESSOR"),
      connection.execute("SELECT COUNT(*) as count FROM ROOM"),
      connection.execute("SELECT COUNT(*) as count FROM SUBJECT"),
      connection.execute("SELECT COUNT(*) as count FROM CLASS"),
      connection.execute("SELECT COUNT(*) as count FROM CLASS_SCHEDULE"),
    ]);

    console.log("\n📊 Estatísticas do banco:");
    console.log(`   - Professores: ${stats[0][0][0].count}`);
    console.log(`   - Salas: ${stats[1][0][0].count}`);
    console.log(`   - Disciplinas: ${stats[2][0][0].count}`);
    console.log(`   - Turmas: ${stats[3][0][0].count}`);
    console.log(`   - Horários: ${stats[4][0][0].count}`);
  } catch (error) {
    console.error("❌ Erro ao inserir dados:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
