const express = require('express');
const router = express.Router();
const db = require('../database');

// Get class schedule (UC10 - Tra cứu lịch học)
router.get('/class/:classId/schedule', (req, res) => {
  db.all(
    `SELECT s.*, u.full_name as teacher_name, r.name as room_name, sb.name as subject_name
     FROM schedule_slots s
     LEFT JOIN teachers t ON s.teacher_id = t.id
     LEFT JOIN users u ON t.user_id = u.id
     LEFT JOIN rooms r ON s.room_id = r.id
     LEFT JOIN subjects sb ON s.subject_id = sb.id
     WHERE s.class_id = ? AND s.schedule_version_id = (
       SELECT id FROM schedule_versions WHERE status = 'published' ORDER BY published_at DESC LIMIT 1
     )
     ORDER BY s.day_of_week, s.period_number`,
    [req.params.classId],
    (err, slots) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Format schedule for student view
      const schedule = {};
      slots.forEach(slot => {
        if (!schedule[slot.day_of_week]) {
          schedule[slot.day_of_week] = [];
        }
        schedule[slot.day_of_week].push({
          period: slot.period_number,
          subject: slot.subject_name,
          teacher: slot.teacher_name,
          room: slot.room_name,
          startTime: slot.start_time,
          endTime: slot.end_time
        });
      });

      res.json(schedule);
    }
  );
});

// Get notifications for student (UC11 - Nhận thông báo)
router.get('/:studentId/notifications', (req, res) => {
  db.all(
    `SELECT * FROM notifications 
     WHERE recipient_id = ? 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [req.params.studentId],
    (err, notifications) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(notifications);
    }
  );
});

// Mark notification as read
router.put('/notifications/:notificationId/read', (req, res) => {
  db.run(
    `UPDATE notifications SET is_read = 1 WHERE id = ?`,
    [req.params.notificationId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Notification marked as read' });
    }
  );
});

module.exports = router;
