#!/bin/bash
# TKB Demo System - API Testing Guide
# Hướng Dẫn Test API bằng curl hoặc Postman

# ============================================================
# SETUP: Khởi động Backend
# ============================================================
# cd backend && npm install && npm start
# Backend chạy trên: http://localhost:3001

# ============================================================
# 1. AUTHENTICATION
# ============================================================

echo "=== 1. AUTHENTICATION ==="

# Register new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "gv001",
    "email": "gv001@school.edu.vn",
    "password": "password123",
    "fullName": "Nguyễn Văn A",
    "phone": "0987654321",
    "role": "teacher"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "gv001",
    "password": "password123"
  }'

# Get user info
curl -X GET http://localhost:3001/api/auth/user/USER_ID

echo "\n"

# ============================================================
# 2. SCHEDULE MANAGEMENT (Admin)
# ============================================================

echo "=== 2. SCHEDULE MANAGEMENT ==="

# Get all schedule versions
curl -X GET http://localhost:3001/api/schedule/versions

# Create new schedule version
curl -X POST http://localhost:3001/api/schedule/versions \
  -H "Content-Type: application/json" \
  -d '{
    "versionName": "TKB_Tuan1",
    "versionType": "master",
    "createdBy": "ADMIN_USER_ID"
  }'

# Get schedule slots for a version
curl -X GET http://localhost:3001/api/schedule/versions/VERSION_ID/slots

# Add schedule slot (with conflict checking)
# This will automatically check HC1 (teacher), HC2 (room), HC3 (capacity)
curl -X POST http://localhost:3001/api/schedule/slots \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleVersionId": "VERSION_ID",
    "teacherId": "TEACHER_ID",
    "classId": "CLASS_ID",
    "roomId": "ROOM_ID",
    "subjectId": "SUBJECT_ID",
    "dayOfWeek": 1,
    "periodNumber": 1,
    "startTime": "07:00",
    "endTime": "07:45"
  }'

# Publish schedule (UC05)
curl -X POST http://localhost:3001/api/schedule/versions/VERSION_ID/publish

echo "\n"

# ============================================================
# 3. TEACHER OPERATIONS
# ============================================================

echo "=== 3. TEACHER OPERATIONS ==="

# Get teacher's schedule
curl -X GET http://localhost:3001/api/teacher/TEACHER_ID/schedule

# Get all schedules (view-only)
curl -X GET http://localhost:3001/api/teacher/all-schedules

# Submit change request (UC07)
# Must include:
# - scheduleSlotId
# - requestedByTeacherId
# - substituteTeacherId (optional)
# - requestType: "CHANGE" or "ABSENCE"
# - reason
# - responsibilityCommitment: true/false (REQUIRED)
curl -X POST http://localhost:3001/api/teacher/change-request \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleSlotId": "SLOT_ID",
    "requestedByTeacherId": "TEACHER_ID",
    "substituteTeacherId": "SUBSTITUTE_TEACHER_ID",
    "requestType": "ABSENCE",
    "reason": "Có việc gia đình cần xử lý",
    "responsibilityCommitment": true
  }'

# Get change requests for teacher
curl -X GET http://localhost:3001/api/teacher/TEACHER_ID/change-requests

echo "\n"

# ============================================================
# 4. STUDENT OPERATIONS
# ============================================================

echo "=== 4. STUDENT OPERATIONS ==="

# Get class schedule (UC10)
curl -X GET http://localhost:3001/api/student/class/CLASS_ID/schedule

# Get notifications
curl -X GET http://localhost:3001/api/student/STUDENT_ID/notifications

# Mark notification as read
curl -X PUT http://localhost:3001/api/student/notifications/NOTIFICATION_ID/read

echo "\n"

# ============================================================
# 5. ADMIN OPERATIONS
# ============================================================

echo "=== 5. ADMIN OPERATIONS ==="

# List all users
curl -X GET http://localhost:3001/api/admin/users

# Create new user
curl -X POST http://localhost:3001/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "gv002",
    "email": "gv002@school.edu.vn",
    "password": "password123",
    "fullName": "Trần Văn B",
    "phone": "0987654322",
    "role": "teacher"
  }'

# Reset user password
curl -X PUT http://localhost:3001/api/admin/users/USER_ID/password \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newpassword123"
  }'

# List classes
curl -X GET http://localhost:3001/api/admin/classes

# Create class
curl -X POST http://localhost:3001/api/admin/classes \
  -H "Content-Type: application/json" \
  -d '{
    "code": "10A",
    "name": "Lớp 10A",
    "grade": 10,
    "totalStudents": 45
  }'

# List rooms
curl -X GET http://localhost:3001/api/admin/rooms

# Create room
curl -X POST http://localhost:3001/api/admin/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "code": "P101",
    "name": "Phòng 101",
    "capacity": 50,
    "roomType": "Classroom"
  }'

# List subjects
curl -X GET http://localhost:3001/api/admin/subjects

# Create subject
curl -X POST http://localhost:3001/api/admin/subjects \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TOAN",
    "name": "Toán Học",
    "weeklyPeriods": 18,
    "intensityLevel": "high"
  }'

# Get pending change requests (UC06)
curl -X GET http://localhost:3001/api/admin/change-requests

# Approve change request
curl -X PUT http://localhost:3001/api/admin/change-requests/REQUEST_ID/approve \
  -H "Content-Type: application/json" \
  -d '{
    "reviewedBy": "ADMIN_USER_ID"
  }'

# Reject change request
curl -X PUT http://localhost:3001/api/admin/change-requests/REQUEST_ID/reject \
  -H "Content-Type: application/json" \
  -d '{
    "reviewedBy": "ADMIN_USER_ID"
  }'

# Get audit logs
curl -X GET http://localhost:3001/api/admin/audit-logs

echo "\n"

# ============================================================
# 6. IMPORT / EXPORT (Excel)
# ============================================================

echo "=== 6. IMPORT / EXPORT ==="

# Download Excel template
curl -X GET http://localhost:3001/api/import/template \
  -o TKB_Template.xlsx

# Upload Excel file
curl -X POST http://localhost:3001/api/import/upload \
  -F "file=@/path/to/file.xlsx"

# After preview, commit the import (UC02 - Smart UPSERT)
curl -X POST http://localhost:3001/api/import/commit \
  -H "Content-Type: application/json" \
  -d '{
    "validData": [
      {
        "Teacher Code": "GV001",
        "Teacher Name": "Nguyễn Văn A",
        "Subject Code": "TOAN",
        "Subject Name": "Toán Học",
        "Weekly Periods": 18,
        "Intensity": "high",
        "Class Code": "10A",
        "Class Name": "Lớp 10A",
        "Grade": 10,
        "Total Students": 45,
        "Room Code": "P101",
        "Room Name": "Phòng 101",
        "Capacity": 50,
        "Room Type": "Classroom"
      }
    ],
    "createdBy": "ADMIN_USER_ID"
  }'

echo "\n"

# ============================================================
# 7. HEALTH CHECK
# ============================================================

echo "=== 7. HEALTH CHECK ==="

curl -X GET http://localhost:3001/api/health

echo "\n"

# ============================================================
# ERROR HANDLING EXAMPLES
# ============================================================

echo "=== ERROR CASES ==="

# HC1: Teacher conflict
# Sẽ trả về lỗi nếu giáo viên đã có lịch cùng tiết
curl -X POST http://localhost:3001/api/schedule/slots \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleVersionId": "VERSION_ID",
    "teacherId": "TEACHER_ID",
    "classId": "CLASS_ID_2",
    "roomId": "ROOM_ID_2",
    "subjectId": "SUBJECT_ID",
    "dayOfWeek": 1,
    "periodNumber": 1,
    "startTime": "07:00",
    "endTime": "07:45"
  }'
# Response: {"error": "Teacher conflict", "constraint": "HC1"}

# HC3: Room capacity exceeded
# Sẽ trả về lỗi nếu sĩ số lớp > sức chứa phòng
curl -X POST http://localhost:3001/api/schedule/slots \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleVersionId": "VERSION_ID",
    "teacherId": "TEACHER_ID",
    "classId": "LARGE_CLASS_ID",
    "roomId": "SMALL_ROOM_ID",
    "subjectId": "SUBJECT_ID",
    "dayOfWeek": 2,
    "periodNumber": 2,
    "startTime": "07:45",
    "endTime": "08:30"
  }'
# Response: {"error": "Room capacity exceeded", "constraint": "HC3"}

# Missing responsibility commitment in change request
# Sẽ trả về lỗi nếu không tick cam kết
curl -X POST http://localhost:3001/api/teacher/change-request \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleSlotId": "SLOT_ID",
    "requestedByTeacherId": "TEACHER_ID",
    "substituteTeacherId": "SUBSTITUTE_TEACHER_ID",
    "requestType": "CHANGE",
    "reason": "Lý do nào đó",
    "responsibilityCommitment": false
  }'
# Response: {"error": "Must confirm responsibility commitment"}

echo "\n"

# ============================================================
# NOTES FOR TESTING
# ============================================================

cat << 'EOF'

📝 LƯU Ý KHI TEST:

1. Thay thế ID placeholders:
   - USER_ID, TEACHER_ID, CLASS_ID, ROOM_ID, SUBJECT_ID, etc.
   - Lấy từ kết quả của các API GET

2. Hard Constraints (Tự động kiểm tra):
   ✓ HC1: Giáo viên không thể dạy 2 lớp cùng lúc
   ✓ HC2: Phòng không thể chứa 2 lớp cùng lúc
   ✓ HC3: Sĩ số lớp ≤ sức chứa phòng
   ✓ HC4: Tổng tiết/tuần = chương trình

3. Thứ tự test recommended:
   1. Register/Login
   2. Create classes, rooms, subjects
   3. Add schedule slots (test constraints)
   4. Publish schedule
   5. Submit change request (with responsibility)
   6. Review & approve request
   7. Check notifications

4. Tools để test API:
   - cURL (command line)
   - Postman (GUI)
   - REST Client (VS Code extension)
   - Thunder Client (VS Code extension)

EOF
