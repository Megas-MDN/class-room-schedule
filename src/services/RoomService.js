const db = require("../database/connection");

class RoomService {
  async getRoomOccupancySchedule() {
    const query = `
            SELECT 
                r.id as room_id,
                r.number as room_number,
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
            ORDER BY b.name, r.number, cs.day_of_week, cs.start_time
        `;
    return await db.query(query);
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
    return days[dayNumber] || "N/A";
  }

  formatRoomSchedule(rawData) {
    const roomSchedules = {};

    rawData.forEach((row) => {
      const roomKey = `${row.building_name} - Sala ${row.room_number}`;

      if (!roomSchedules[roomKey]) {
        roomSchedules[roomKey] = {
          room_id: row.room_id,
          building: row.building_name,
          room_number: row.room_number,
          schedule: [],
        };
      }

      if (row.status === "OCUPADA") {
        roomSchedules[roomKey].schedule.push({
          day: this.getDayName(row.day_of_week),
          start_time: row.start_time,
          end_time: row.end_time,
          subject: row.subject_name,
          class_code: row.class_code,
          status: "OCUPADA",
        });
      }
    });

    return roomSchedules;
  }
}

module.exports = new RoomService();
