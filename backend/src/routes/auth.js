const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../database');

// Register
router.post('/register', (req, res) => {
  const { username, email, password, fullName, phone, role } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const userId = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (id, username, email, password_hash, full_name, phone_number, role) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, username, email, passwordHash, fullName, phone, role],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create role-specific record
      if (role === 'teacher') {
        const teacherId = uuidv4();
        db.run(
          `INSERT INTO teachers (id, user_id) VALUES (?, ?)`,
          [teacherId, userId]
        );
      } else if (role === 'admin') {
        const adminId = uuidv4();
        db.run(
          `INSERT INTO admins (id, user_id) VALUES (?, ?)`,
          [adminId, userId]
        );
      }

      res.status(201).json({ 
        message: 'User registered successfully',
        userId 
      });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        }
      });
    }
  );
});

// Get user info
router.get('/user/:id', (req, res) => {
  db.get(
    `SELECT id, username, email, full_name, phone_number, role FROM users WHERE id = ?`,
    [req.params.id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

module.exports = router;
