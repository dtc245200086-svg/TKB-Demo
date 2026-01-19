const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// Get teacher's schedule
router.get('/:teacherId/schedule', (req, res) => {
  db.all(
    `SELECT s.*, c.name as class_name, r.name as room_name, sb.name as subject_name
     FROM schedule_slots s
     LEFT JOIN classes c ON s.class_id = c.id
     LEFT JOIN rooms r ON s.room_id = r.id
     LEFT JOIN subjects sb ON s.subject_id = sb.id
     WHERE s.teacher_id = ? AND s.schedule_version_id = (
       SELECT id FROM schedule_versions WHERE status = 'published' ORDER BY published_at DESC LIMIT 1
     )
     ORDER BY s.day_of_week, s.period_number`,
    [req.params.teacherId],
    (err, slots) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(slots);
    }
  );
});

// Get all schedules (view-only for teachers)
router.get('/all-schedules', (req, res) => {
  db.all(
    `SELECT s.*, t.user_id as teacher_id, c.name as class_name, r.name as room_name, sb.name as subject_name,
            u.full_name as teacher_name
     FROM schedule_slots s
     LEFT JOIN teachers t ON s.teacher_id = t.id
     LEFT JOIN users u ON t.user_id = u.id
     LEFT JOIN classes c ON s.class_id = c.id
     LEFT JOIN rooms r ON s.room_id = r.id
     LEFT JOIN subjects sb ON s.subject_id = sb.id
     WHERE s.schedule_version_id = (
       SELECT id FROM schedule_versions WHERE status = 'published' ORDER BY published_at DESC LIMIT 1
     )
     ORDER BY s.day_of_week, s.period_number`,
    (err, slots) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(slots);
    }
  );
});

// Submit change request (UC07 - Đổi tiết/Báo nghỉ)
router.post('/change-request', (req, res) => {
  const {
    scheduleSlotId,
    requestedByTeacherId,
    substituteTeacherId,
    requestType,
    reason,
    responsibilityCommitment
  } = req.body;

  if (!responsibilityCommitment) {
    return res.status(400).json({ 
      error: 'Must confirm responsibility commitment',
      code: 'RESPONSIBILITY_REQUIRED'
    });
  }

  // Pre-check for conflicts
  if (substituteTeacherId) {
    db.get(
      `SELECT ss.* FROM schedule_slots ss
       WHERE ss.id = ? AND ss.schedule_version_id = (
         SELECT id FROM schedule_versions WHERE status = 'published' ORDER BY published_at DESC LIMIT 1
       )`,
      [scheduleSlotId],
      (err, slot) => {
        if (!slot) return res.status(404).json({ error: 'Schedule slot not found' });

        // Check if substitute has conflict
        db.get(
          `SELECT COUNT(*) as count FROM schedule_slots 
           WHERE teacher_id = ? AND day_of_week = ? AND period_number = ? 
           AND schedule_version_id = ?`,
          [substituteTeacherId, slot.day_of_week, slot.period_number, slot.schedule_version_id],
          (err, conflict) => {
            if (conflict.count > 0) {
              return res.status(400).json({
                error: 'Substitute teacher has schedule conflict',
                code: 'SUBSTITUTE_CONFLICT',
                severity: 'ERROR'
              });
            }

            submitChangeRequest();
          }
        );
      }
    );
  } else {
    submitChangeRequest();
  }

  function submitChangeRequest() {
    const requestId = uuidv4();
    db.run(
      `INSERT INTO change_requests 
       (id, schedule_slot_id, requested_by_teacher_id, substitute_teacher_id, request_type, reason, responsibility_commitment, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [requestId, scheduleSlotId, requestedByTeacherId, substituteTeacherId, requestType, reason, responsibilityCommitment ? 1 : 0, 'pending'],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Send notification to substitute teacher if applicable
        if (substituteTeacherId) {
          const notificationId = uuidv4();
          db.run(
            `INSERT INTO notifications (id, recipient_id, title, message, notification_type, related_id)
             SELECT ?, t.user_id, ?, ?, ?, ?
             FROM teachers t WHERE t.id = ?`,
            [notificationId, 'Schedule Change Request', `You have been requested as substitute. Please review the request.`, 'PASSIVE_CONSENT', requestId, substituteTeacherId]
          );
        }

        res.status(201).json({ message: 'Change request submitted', requestId });
      }
    );
  }
});

// Get change requests for teacher
router.get('/:teacherId/change-requests', (req, res) => {
  db.all(
    `SELECT cr.*, s.day_of_week, s.period_number, c.name as class_name, sb.name as subject_name
     FROM change_requests cr
     JOIN schedule_slots s ON cr.schedule_slot_id = s.id
     LEFT JOIN classes c ON s.class_id = c.id
     LEFT JOIN subjects sb ON s.subject_id = sb.id
     WHERE cr.requested_by_teacher_id = ?
     ORDER BY cr.created_at DESC`,
    [req.params.teacherId],
    (err, requests) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(requests);
    }
  );
});

module.exports = router;
