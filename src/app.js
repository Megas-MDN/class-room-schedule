// src/app.js
const express = require("express");
const db = require("./database/connection");
const ProfessorService = require("./services/ProfessorService");
const RoomService = require("./services/RoomService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Inicializar conexão com banco
async function initializeApp() {
  try {
    await db.connect();
    console.log("Sistema inicializado com sucesso");
  } catch (error) {
    console.error("Erro ao inicializar sistema:", error);
    process.exit(1);
  }
}

// Rotas

// 1. Carga horária dos professores
app.get("/api/professors/workload", async (req, res) => {
  try {
    const workload = await ProfessorService.getProfessorWorkload();
    res.json({
      success: true,
      data: workload,
      summary: {
        total_professors: workload.length,
        average_hours:
          workload.reduce(
            (sum, prof) => sum + parseFloat(prof.total_hours_per_week),
            0,
          ) / workload.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 2. Ocupação das salas
app.get("/api/rooms/occupancy", async (req, res) => {
  try {
    const occupancy = await RoomService.getRoomOccupancy();
    res.json({
      success: true,
      data: occupancy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 3. Análise detalhada das salas
app.get("/api/rooms/analysis", async (req, res) => {
  try {
    const analysis = await RoomService.getRoomScheduleAnalysis();
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 4. Salas disponíveis em horário específico
app.get("/api/rooms/available", async (req, res) => {
  try {
    const { day_of_week, start_time, end_time } = req.query;

    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: "Parâmetros obrigatórios: day_of_week, start_time, end_time",
      });
    }

    const availableRooms = await RoomService.getAvailableRooms(
      day_of_week,
      start_time,
      end_time,
    );
    res.json({
      success: true,
      data: availableRooms,
      query_parameters: {
        day_of_week: day_of_week,
        start_time: start_time,
        end_time: end_time,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Rota de teste
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Sistema de Gestão Universitária funcionando",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  initializeApp();
});

module.exports = app;
