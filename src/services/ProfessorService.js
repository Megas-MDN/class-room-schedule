// src/services/ProfessorService.js
const db = require("../database/connection");

class ProfessorService {
  async getProfessorWorkload() {
    const query = `
            SELECT 
                p.id as professor_id,
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
            GROUP BY p.id, d.name, t.name
            ORDER BY total_hours_per_week DESC
        `;

    return await db.query(query);
  }

  async getProfessorDetailedSchedule(professorId) {
    const query = `
            SELECT 
                p.id as professor_id,
                d.name as department_name,
                s.name as subject_name,
                c.code as class_code,
                cs.day_of_week,
                cs.start_time,
                cs.end_time,
                r.id as room_id,
                b.name as building_name
            FROM PROFESSOR p
            JOIN DEPARTMENT d ON p.department_id = d.id
            JOIN CLASS c ON p.id = c.professor_id
            JOIN SUBJECT s ON c.subject_id = s.id
            JOIN CLASS_SCHEDULE cs ON c.id = cs.class_id
            JOIN ROOM r ON cs.room_id = r.id
            JOIN BUILDING b ON r.building_id = b.id
            WHERE p.id = ?
            ORDER BY cs.day_of_week, cs.start_time
        `;

    return await db.query(query, [professorId]);
  }
}

module.exports = new ProfessorService();
