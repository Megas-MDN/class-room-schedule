// src/services/RoomService.js
const db = require("../database/connection");

class RoomService {
  async getRoomOccupancy() {
    const query = `
            SELECT 
                r.id as room_id,
                b.name as building_name,
                cs.day_of_week,
                cs.start_time,
                cs.end_time,
                s.name as subject_name,
                c.code as class_code,
                CASE 
                    WHEN cs.id IS NOT NULL THEN 'OCUPADA'
                    ELSE 'LIVRE'
                END as status
            FROM ROOM r
            JOIN BUILDING b ON r.building_id = b.id
            LEFT JOIN CLASS_SCHEDULE cs ON r.id = cs.room_id
            LEFT JOIN CLASS c ON cs.class_id = c.id
            LEFT JOIN SUBJECT s ON c.subject_id = s.id
            ORDER BY r.id, cs.day_of_week, cs.start_time
        `;

    return await db.query(query);
  }

  async getAvailableRooms(dayOfWeek, startTime, endTime) {
    const query = `
            SELECT DISTINCT
                r.id as room_id,
                b.name as building_name
            FROM ROOM r
            JOIN BUILDING b ON r.building_id = b.id
            WHERE r.id NOT IN (
                SELECT DISTINCT cs.room_id
                FROM CLASS_SCHEDULE cs
                WHERE cs.day_of_week = ?
                AND NOT (cs.end_time <= ? OR cs.start_time >= ?)
            )
            ORDER BY b.name, r.id
        `;

    return await db.query(query, [dayOfWeek, startTime, endTime]);
  }

  async getRoomScheduleAnalysis() {
    const rooms = await this.getRoomOccupancy();
    const analysis = {};

    rooms.forEach((room) => {
      const roomKey = `${room.building_name} - Sala ${room.room_id}`;

      if (!analysis[roomKey]) {
        analysis[roomKey] = {
          building: room.building_name,
          room_id: room.room_id,
          schedule: [],
          occupancy_rate: 0,
        };
      }

      if (room.status === "OCUPADA") {
        analysis[roomKey].schedule.push({
          day_of_week: this.getDayName(room.day_of_week),
          start_time: room.start_time,
          end_time: room.end_time,
          subject: room.subject_name,
          class_code: room.class_code,
          status: "OCUPADA",
        });
      }
    });

    // Calcular taxa de ocupação (considerando 5 dias úteis, 12 horas/dia)
    Object.keys(analysis).forEach((roomKey) => {
      const totalScheduledHours = analysis[roomKey].schedule.reduce(
        (total, schedule) => {
          const start = new Date(`1970-01-01T${schedule.start_time}`);
          const end = new Date(`1970-01-01T${schedule.end_time}`);
          return total + (end - start) / (1000 * 60 * 60);
        },
        0,
      );

      const maxWeeklyHours = 5 * 12; // 5 dias × 12 horas
      analysis[roomKey].occupancy_rate = (
        (totalScheduledHours / maxWeeklyHours) *
        100
      ).toFixed(2);
    });

    return analysis;
  }

  getDayName(dayNumber) {
    const days = [
      "",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
      "Domingo",
    ];
    return days[dayNumber] || "Desconhecido";
  }
}

module.exports = new RoomService();
