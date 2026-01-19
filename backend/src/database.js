const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'tkb.db');

// Create data directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Users table (Base class)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      phone_number TEXT,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Teachers table
  db.run(`
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      subject_id TEXT,
      experience_years INTEGER,
      preferred_schedule TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    )
  `);

  // Students table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      class_id TEXT NOT NULL,
      admission_number TEXT UNIQUE,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (class_id) REFERENCES classes(id)
    )
  `);

  // Admin table
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      department TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Classes table
  db.run(`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      grade INTEGER,
      total_students INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Rooms table
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      room_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Subjects table
  db.run(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      weekly_periods INTEGER,
      intensity_level TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Schedule versions table
  db.run(`
    CREATE TABLE IF NOT EXISTS schedule_versions (
      id TEXT PRIMARY KEY,
      version_name TEXT NOT NULL,
      version_type TEXT,
      status TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published_at DATETIME,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Schedule slots (Time periods)
  db.run(`
    CREATE TABLE IF NOT EXISTS schedule_slots (
      id TEXT PRIMARY KEY,
      schedule_version_id TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      class_id TEXT NOT NULL,
      room_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      day_of_week INTEGER,
      period_number INTEGER,
      start_time TEXT,
      end_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (schedule_version_id) REFERENCES schedule_versions(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id),
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      UNIQUE(schedule_version_id, teacher_id, day_of_week, period_number),
      UNIQUE(schedule_version_id, room_id, day_of_week, period_number)
    )
  `);

  // Change requests (UC07)
  db.run(`
    CREATE TABLE IF NOT EXISTS change_requests (
      id TEXT PRIMARY KEY,
      schedule_slot_id TEXT NOT NULL,
      requested_by_teacher_id TEXT NOT NULL,
      substitute_teacher_id TEXT,
      request_type TEXT,
      reason TEXT,
      responsibility_commitment BOOLEAN,
      status TEXT DEFAULT 'pending',
      reviewed_by TEXT,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (schedule_slot_id) REFERENCES schedule_slots(id),
      FOREIGN KEY (requested_by_teacher_id) REFERENCES teachers(id),
      FOREIGN KEY (substitute_teacher_id) REFERENCES teachers(id),
      FOREIGN KEY (reviewed_by) REFERENCES users(id)
    )
  `);

  // Notifications
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipient_id TEXT NOT NULL,
      title TEXT,
      message TEXT,
      notification_type TEXT,
      related_id TEXT,
      is_read BOOLEAN DEFAULT 0,
      channel TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    )
  `);

  // Audit logs
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      actor_id TEXT,
      entity_type TEXT,
      entity_id TEXT,
      old_value TEXT,
      new_value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (actor_id) REFERENCES users(id)
    )
  `);

  console.log('Database tables initialized');
  seedDemoData();
}

// Seed demo data
function seedDemoData() {
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');

  // Create admin user
  db.get("SELECT * FROM users WHERE username = 'admin01'", (err, row) => {
    if (!row) {
      const adminId = uuidv4();
      const adminHash = bcrypt.hashSync('123456', 10);
      db.run(
        `INSERT INTO users (id, username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [adminId, 'admin01', 'admin@school.edu', adminHash, 'Phó Giáo Vụ', 'admin'],
        (err) => {
          if (!err) console.log('✓ Demo admin account created: admin01 / 123456');
        }
      );
    }
  });

  // Create teacher user
  db.get("SELECT * FROM users WHERE username = 'teacher01'", (err, row) => {
    if (!row) {
      const teacherId = uuidv4();
      const teacherHash = bcrypt.hashSync('123456', 10);
      db.run(
        `INSERT INTO users (id, username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [teacherId, 'teacher01', 'teacher01@school.edu', teacherHash, 'Nguyễn Văn A', 'teacher'],
        (err) => {
          if (!err) console.log('✓ Demo teacher account created: teacher01 / 123456');
        }
      );
    }
  });

  // Create student user
  db.get("SELECT * FROM users WHERE username = 'student01'", (err, row) => {
    if (!row) {
      const studentId = uuidv4();
      const studentHash = bcrypt.hashSync('123456', 10);
      db.run(
        `INSERT INTO users (id, username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [studentId, 'student01', 'student01@school.edu', studentHash, 'Trần Thị B', 'student'],
        (err) => {
          if (!err) console.log('✓ Demo student account created: student01 / 123456');
        }
      );
    }
  });
}

module.exports = db;
