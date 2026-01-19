const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// Get all schedule versions
router.get('/versions', (req, res) => {
  db.all(
    `SELECT * FROM schedule_versions ORDER BY created_at DESC`,
    (err, versions) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(versions);
    }
  );
});

// Create new schedule version
router.post('/versions', (req, res) => {
  const { versionName, versionType, createdBy } = req.body;
  const versionId = uuidv4();

  db.run(
    `INSERT INTO schedule_versions (id, version_name, version_type, status, created_by) 
     VALUES (?, ?, ?, ?, ?)`,
    [versionId, versionName, versionType, 'draft', createdBy],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Schedule version created', versionId });
    }
  );
});

// Get schedule slots for a version
router.get('/versions/:versionId/slots', (req, res) => {
  db.all(
    `SELECT s.*, t.id as teacher_name, c.name as class_name, r.name as room_name, sb.name as subject_name
     FROM schedule_slots s
     LEFT JOIN teachers t ON s.teacher_id = t.id
     LEFT JOIN classes c ON s.class_id = c.id
     LEFT JOIN rooms r ON s.room_id = r.id
     LEFT JOIN subjects sb ON s.subject_id = sb.id
     WHERE s.schedule_version_id = ?
     ORDER BY s.day_of_week, s.period_number`,
    [req.params.versionId],
    (err, slots) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(slots);
    }
  );
});

// Add schedule slot (UC04 - Manual scheduling)
router.post('/slots', (req, res) => {
  const {
    scheduleVersionId,
    teacherId,
    classId,
    roomId,
    subjectId,
    dayOfWeek,
    periodNumber,
    startTime,
    endTime
  } = req.body;

  // Validate room capacity (HC3)
  db.get(
    `SELECT r.capacity, c.total_students 
     FROM rooms r, classes c 
     WHERE r.id = ? AND c.id = ?`,
    [roomId, classId],
    (err, result) => {
      if (result && result.total_students > result.capacity) {
        return res.status(400).json({ 
          error: 'Room capacity exceeded',
          constraint: 'HC3'
        });
      }

      // Check for teacher conflict (HC1)
      db.get(
        `SELECT COUNT(*) as count FROM schedule_slots 
         WHERE schedule_version_id = ? AND teacher_id = ? AND day_of_week = ? AND period_number = ?`,
        [scheduleVersionId, teacherId, dayOfWeek, periodNumber],
        (err, conflict) => {
          if (conflict.count > 0) {
            return res.status(400).json({
              error: 'Teacher conflict - already teaching another class',
              constraint: 'HC1'
            });
          }

          // Check for room conflict (HC2)
          db.get(
            `SELECT COUNT(*) as count FROM schedule_slots 
             WHERE schedule_version_id = ? AND room_id = ? AND day_of_week = ? AND period_number = ?`,
            [scheduleVersionId, roomId, dayOfWeek, periodNumber],
            (err, roomConflict) => {
              if (roomConflict.count > 0) {
                return res.status(400).json({
                  error: 'Room conflict - already in use',
                  constraint: 'HC2'
                });
              }

              const slotId = uuidv4();
              db.run(
                `INSERT INTO schedule_slots 
                 (id, schedule_version_id, teacher_id, class_id, room_id, subject_id, day_of_week, period_number, start_time, end_time)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [slotId, scheduleVersionId, teacherId, classId, roomId, subjectId, dayOfWeek, periodNumber, startTime, endTime],
                (err) => {
                  if (err) return res.status(500).json({ error: err.message });
                  res.status(201).json({ message: 'Schedule slot created', slotId });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Publish schedule
router.post('/versions/:versionId/publish', (req, res) => {
  db.run(
    `UPDATE schedule_versions SET status = 'published', published_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [req.params.versionId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Schedule published successfully' });
    }
  );
});

module.exports = router;
