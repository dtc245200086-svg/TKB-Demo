const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// Manage users
router.get('/users', (req, res) => {
  db.all(
    `SELECT id, username, email, full_name, phone_number, role FROM users ORDER BY created_at DESC`,
    (err, users) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(users);
    }
  );
});

router.post('/users', (req, res) => {
  const { username, email, password, fullName, phone, role } = req.body;
  const userId = uuidv4();
  const bcrypt = require('bcryptjs');
  const passwordHash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (id, username, email, password_hash, full_name, phone_number, role) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, username, email, passwordHash, fullName, phone, role],
    (err) => {
      if (err) return res.status(400).json({ error: 'User already exists' });
      res.status(201).json({ message: 'User created', userId });
    }
  );
});

router.put('/users/:userId/password', (req, res) => {
  const { newPassword } = req.body;
  const bcrypt = require('bcryptjs');
  const passwordHash = bcrypt.hashSync(newPassword, 10);

  db.run(
    `UPDATE users SET password_hash = ? WHERE id = ?`,
    [passwordHash, req.params.userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Password reset successfully' });
    }
  );
});

// Manage classes
router.get('/classes', (req, res) => {
  db.all(
    `SELECT * FROM classes ORDER BY grade, name`,
    (err, classes) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(classes);
    }
  );
});

router.post('/classes', (req, res) => {
  const { code, name, grade, totalStudents } = req.body;
  const classId = uuidv4();

  db.run(
    `INSERT INTO classes (id, code, name, grade, total_students) VALUES (?, ?, ?, ?, ?)`,
    [classId, code, name, grade, totalStudents],
    (err) => {
      if (err) return res.status(400).json({ error: 'Class code already exists' });
      res.status(201).json({ message: 'Class created', classId });
    }
  );
});

// Manage rooms
router.get('/rooms', (req, res) => {
  db.all(
    `SELECT * FROM rooms ORDER BY code`,
    (err, rooms) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rooms);
    }
  );
});

router.post('/rooms', (req, res) => {
  const { code, name, capacity, roomType } = req.body;
  const roomId = uuidv4();

  db.run(
    `INSERT INTO rooms (id, code, name, capacity, room_type) VALUES (?, ?, ?, ?, ?)`,
    [roomId, code, name, capacity, roomType],
    (err) => {
      if (err) return res.status(400).json({ error: 'Room code already exists' });
      res.status(201).json({ message: 'Room created', roomId });
    }
  );
});

// Manage subjects
router.get('/subjects', (req, res) => {
  db.all(
    `SELECT * FROM subjects ORDER BY code`,
    (err, subjects) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(subjects);
    }
  );
});

router.post('/subjects', (req, res) => {
  const { code, name, weeklyPeriods, intensityLevel } = req.body;
  const subjectId = uuidv4();

  db.run(
    `INSERT INTO subjects (id, code, name, weekly_periods, intensity_level) VALUES (?, ?, ?, ?, ?)`,
    [subjectId, code, name, weeklyPeriods, intensityLevel],
    (err) => {
      if (err) return res.status(400).json({ error: 'Subject code already exists' });
      res.status(201).json({ message: 'Subject created', subjectId });
    }
  );
});

// Review change requests (UC06)
router.get('/change-requests', (req, res) => {
  db.all(
    `SELECT cr.*, u.full_name as requested_by_name, s.day_of_week, s.period_number, c.name as class_name
     FROM change_requests cr
     JOIN teachers t ON cr.requested_by_teacher_id = t.id
     JOIN users u ON t.user_id = u.id
     JOIN schedule_slots s ON cr.schedule_slot_id = s.id
     LEFT JOIN classes c ON s.class_id = c.id
     WHERE cr.status = 'pending'
     ORDER BY cr.created_at`,
    (err, requests) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(requests);
    }
  );
});

router.put('/change-requests/:requestId/:action', (req, res) => {
  const { requestId, action } = req.params;
  const { reviewedBy } = req.body;
  const status = action === 'approve' ? 'approved' : 'rejected';

  db.run(
    `UPDATE change_requests SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, reviewedBy, requestId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Send notification
      if (status === 'approved') {
        db.get(
          `SELECT requested_by_teacher_id, substitute_teacher_id FROM change_requests WHERE id = ?`,
          [requestId],
          (err, request) => {
            if (request) {
              const { v4: uuidv4 } = require('uuid');
              const notificationId = uuidv4();
              db.run(
                `INSERT INTO notifications (id, recipient_id, title, message, notification_type, related_id)
                 SELECT ?, t.user_id, ?, ?, ?, ?
                 FROM teachers t WHERE t.id = ?`,
                [notificationId, request.requested_by_teacher_id, 'Change Request Approved', 'Your change request has been approved.', 'CHANGE_REQUEST', requestId]
              );
            }
          }
        );
      }

      res.json({ message: `Change request ${action}ed successfully` });
    }
  );
});

// Audit logs
router.get('/audit-logs', (req, res) => {
  db.all(
    `SELECT al.*, u.full_name as actor_name 
     FROM audit_logs al
     LEFT JOIN users u ON al.actor_id = u.id
     ORDER BY al.created_at DESC
     LIMIT 100`,
    (err, logs) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(logs);
    }
  );
});

module.exports = router;
