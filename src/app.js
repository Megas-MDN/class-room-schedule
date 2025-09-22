const express = require("express");
const db = require("./database/connection");
const RoomService = require("./services/RoomService");

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar banco
async function init() {
  await db.connect();
  console.log("Conectado ao banco de dados");
}

// 1. Endpoint para carga horária dos professores
app.get("/api/professors/workload", async (req, res) => {
  try {
    const query = `
            SELECT 
                p.id as professor_id,
                p.name as professor_name,
                d.name as department_name,
                t.name as title_name,
                COALESCE(SUM(
                    TIME_TO_SEC(TIMEDIFF(cs.end_time, cs.start_time)) / 3600
                ), 0) as total_hours_per_week,
                COUNT(DISTINCT c.id) as total_classes
            FROM PROFESSOR p
            LEFT JOIN DEPARTMENT d ON p.department_id = d.id
            LEFT JOIN TITLE t ON p.title_id = t.id
            LEFT JOIN CLASS c ON p.id = c.professor_id
            LEFT JOIN CLASS_SCHEDULE cs ON c.id = cs.class_id
            GROUP BY p.id, p.name, d.name, t.name
            ORDER BY total_hours_per_week DESC
        `;

    const result = await db.query(query);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Endpoint para horários das salas
app.get("/api/rooms/schedule", async (req, res) => {
  try {
    const rawData = await RoomService.getRoomOccupancySchedule();
    const formattedSchedule = RoomService.formatRoomSchedule(rawData);

    res.json({
      success: true,
      data: formattedSchedule,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor na porta ${PORT}`);
  init();
});
