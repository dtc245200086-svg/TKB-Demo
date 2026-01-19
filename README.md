# TKB Demo System - School Schedule Management

## Hệ Thống Quản Lý Thời Khóa Biểu (TKB) THPT

A comprehensive demonstration system for managing school schedules (Timetable Management System) for high schools, based on software requirements specification (SRS).

### Project Structure

```
TKB-Demo/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── server.js        # Main server entry
│   │   ├── database.js      # SQLite database schema
│   │   └── routes/          # API endpoints
│   │       ├── auth.js      # User authentication
│   │       ├── schedule.js  # Schedule management (UC01-UC05)
│   │       ├── teacher.js   # Teacher features (UC07-UC09)
│   │       ├── student.js   # Student features (UC10-UC11)
│   │       ├── admin.js     # Admin features (UC06, UC12-UC13)
│   │       └── import.js    # Excel import/export (UC01-UC02)
│   ├── data/            # SQLite database
│   └── package.json
│
├── frontend/
│   ├── admin/           # React Admin Dashboard
│   ├── mobile/          # Mobile app for teachers
│   └── student/         # Student schedule viewer
│
└── README.md           # This file
```

### Key Features Implemented

#### For Admin (Giáo Vụ) - Web Dashboard
- **UC01**: Import data từ Excel with preview & validation
- **UC02**: Preview and validate imported data
- **UC03**: Auto-schedule with conflict checking
- **UC04**: Manual schedule adjustment (drag-drop)
- **UC05**: Publish schedule and send notifications
- **UC06**: Review and approve teacher change requests

#### For Teachers - Mobile App
- **UC07**: Submit schedule change requests (Đổi tiết/Báo nghỉ)
- **UC08**: View personal and school-wide schedule
- **UC09**: Receive notifications about changes

#### For Students - Web Viewer
- **UC10**: View class schedule
- **UC11**: Receive schedule change notifications

#### For System Admin
- **UC12**: Manage users (teachers, students, admins)
- **UC13**: Audit logs

### Hard Constraints (HC) - Automatically Enforced

- **HC1**: No teacher can teach 2 classes at same time
- **HC2**: No room can be used by 2 classes simultaneously
- **HC3**: Class enrollment cannot exceed room capacity
- **HC4**: Weekly periods must match curriculum requirements

### Soft Constraints (SC) - Warnings

- **SC1**: Warning if subjects too concentrated or scattered
- **SC2**: Warning if heavy subjects (Math, Physics, Chemistry) scheduled last period
- **SC3**: Warning if teacher must move between locations in short time
- **SC4**: Honor teacher schedule preferences

### Technology Stack

**Backend:**
- Node.js + Express
- SQLite3
- JWT Authentication
- bcryptjs for password hashing
- multer for file uploads
- xlsx for Excel handling

**Frontend (To be implemented):**
- React for Admin Dashboard
- React Native / Flutter for Mobile App
- Responsive design for Students

### Quick Start

#### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3001`
Health check: `http://localhost:3001/api/health`

#### 2. Database

SQLite database is automatically created in `backend/data/tkb.db` on first run.

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/user/:id` - Get user info

#### Schedule Management (Admin)
- `GET /api/schedule/versions` - List schedule versions
- `POST /api/schedule/versions` - Create new version
- `GET /api/schedule/versions/:versionId/slots` - Get schedule slots
- `POST /api/schedule/slots` - Add schedule slot (with conflict validation)
- `POST /api/schedule/versions/:versionId/publish` - Publish schedule

#### Teacher Operations
- `GET /api/teacher/:teacherId/schedule` - Get teacher's schedule
- `GET /api/teacher/all-schedules` - View all schedules
- `POST /api/teacher/change-request` - Submit change request
- `GET /api/teacher/:teacherId/change-requests` - View requests

#### Student Operations
- `GET /api/student/class/:classId/schedule` - Get class schedule
- `GET /api/student/:studentId/notifications` - Get notifications
- `PUT /api/student/notifications/:notificationId/read` - Mark read

#### Admin Operations
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `GET /api/admin/classes` - List classes
- `POST /api/admin/classes` - Create class
- `GET /api/admin/rooms` - List rooms
- `POST /api/admin/rooms` - Create room
- `GET /api/admin/subjects` - List subjects
- `POST /api/admin/subjects` - Create subject
- `GET /api/admin/change-requests` - Pending change requests
- `PUT /api/admin/change-requests/:id/approve|reject` - Review requests
- `GET /api/admin/audit-logs` - Audit logs

#### Data Import
- `POST /api/import/upload` - Upload Excel file (UC01)
- `POST /api/import/commit` - Save imported data with UPSERT (UC02)
- `GET /api/import/template` - Download Excel template

### Use Cases Reference

| UC # | Name | Actor | Status |
|------|------|-------|--------|
| UC01 | Import Data from Excel | Admin | ✓ Implemented |
| UC02 | Preview & Validate | Admin | ✓ Implemented |
| UC03 | Auto Schedule | Admin | ○ Schema Ready |
| UC04 | Manual Schedule | Admin | ✓ Implemented |
| UC05 | Publish Schedule | Admin | ✓ Implemented |
| UC06 | Review Changes | Admin | ✓ Implemented |
| UC07 | Submit Change Request | Teacher | ✓ Implemented |
| UC08 | View Schedule | Teacher | ✓ Implemented |
| UC09 | Receive Notifications | Teacher | ✓ Implemented |
| UC10 | View Class Schedule | Student | ✓ Implemented |
| UC11 | Receive Notifications | Student | ✓ Implemented |
| UC12 | Manage Users | System Admin | ✓ Implemented |
| UC13 | Audit Logs | System Admin | ✓ Implemented |

### Database Schema

The system implements the complete data model from SRS:

**User Groups:**
- `users` - Base user accounts with role-based access
- `teachers` - Teacher-specific information
- `students` - Student records with class assignment
- `admins` - System administrators

**Schedule Core:**
- `schedule_versions` - TKB versions (Master/Hotfix)
- `schedule_slots` - Individual class periods
- `classes` - Class entities
- `rooms` - Classroom resources
- `subjects` - Subject/Course definitions

**Operations:**
- `change_requests` - Đổi tiết/Báo nghỉ requests
- `notifications` - Multi-channel notifications
- `audit_logs` - Change tracking for compliance

### Validation & Constraints

All hard constraints are enforced at the database and API level:

```javascript
// HC1 - Teacher conflict check
SELECT * FROM schedule_slots 
WHERE teacher_id = ? AND day_of_week = ? AND period_number = ?

// HC2 - Room conflict check  
SELECT * FROM schedule_slots 
WHERE room_id = ? AND day_of_week = ? AND period_number = ?

// HC3 - Capacity check
if (classSize > roomCapacity) {
  return error("Room capacity exceeded");
}
```

### Sample Data

To seed the database with sample data:

```bash
npm run seed
```

This creates:
- 5 test users (3 teachers, 1 admin, 1 student)
- 3 classes (10A, 10B, 11A)
- 5 rooms
- 8 subjects
- Sample schedule

### Performance Requirements (NFR)

- Conflict check response: < 0.5 seconds
- Excel import (1000 rows): < 5 seconds
- Schedule publishing: Async with notifications

### Security

- Password hashing with bcryptjs
- Teacher phone numbers hidden from students
- User role-based access control
- Audit logging of all changes
- CORS configuration for cross-origin requests

### Future Enhancements

- [ ] React Admin Dashboard UI
- [ ] React Native Mobile App
- [ ] Advanced scheduling algorithm (AI/ML)
- [ ] Multi-school support
- [ ] LMS integration
- [ ] Real-time WebSocket notifications
- [ ] Zalo/Email notification integration

### Documentation References

Based on official requirements:
- Tài liệu Đặc tả Yêu cầu Phần mềm (SRS)
- Tài liệu Yêu cầu Người dùng (URD)
- IEEE Software Requirements Specification Standard

### License

Educational Project - For demonstration purposes

---

**Developed for:** School Schedule Management System (TKB - Thời Khóa Biểu)  
**Date:** 2026  
**Version:** 1.0.0
