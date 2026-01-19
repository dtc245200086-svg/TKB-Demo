# TKB Demo System - Quick Start Guide
## Hướng Dẫn Thuyết Trình Nhanh

### 🎯 Tổng Quan Dự Án

**TKB** = **Thời Khóa Biểu** (School Schedule/Timetable)

Đây là hệ thống quản lý lịch học và thời khóa biểu cho các trường THPT, dựa trên tài liệu yêu cầu kỹ thuật (SRS) và tài liệu yêu cầu người dùng (URD) do nhóm phát triển cung cấp.

**Mục tiêu:** Giảm 80% thời gian xếp lịch thủ công, loại bỏ xung đột lịch, cập nhật tức thời.

---

## 📁 Cấu Trúc Dự Án

```
TKB-Demo/
├── backend/                 # 🔧 Server Backend
│   ├── src/
│   │   ├── server.js        # Khởi động server
│   │   ├── database.js      # Schema & Kết nối DB
│   │   └── routes/          # API endpoints
│   │       ├── auth.js      # Đăng ký/Đăng nhập
│   │       ├── schedule.js  # UC01-UC05: Xếp lịch
│   │       ├── teacher.js   # UC07-UC09: Tác nghiệp
│   │       ├── student.js   # UC10-UC11: Tra cứu
│   │       ├── admin.js     # UC06,12,13: Quản trị
│   │       └── import.js    # Import Excel
│   ├── data/                # 📊 SQLite Database
│   └── package.json
│
├── frontend/
│   ├── admin/index.html     # 💻 Admin Dashboard
│   ├── mobile/index.html    # 📱 Teacher Mobile App
│   └── student/index.html   # 👨‍🎓 Student Schedule Viewer
│
└── README.md               # Full Documentation
```

---

## 🚀 Bắt Đầu Nhanh

### Bước 1: Khởi Động Backend

```bash
cd backend
npm install
npm start
```

**Kết quả:**
```
✓ Connected to SQLite database
✓ Database tables initialized
✓ TKB Demo Backend Server running on port 3001
✓ Health check: http://localhost:3001/api/health
```

### Bước 2: Mở Frontend

**Admin Dashboard:**
```
Mở trình duyệt → file:///c:\Users\phamt\OneDrive\Desktop\TKB-Demo\frontend\admin\index.html
```

**Teacher Mobile App:**
```
Mở trình duyệt → file:///c:\Users\phamt\OneDrive\Desktop\TKB-Demo\frontend\mobile\index.html
```

**Student Schedule Viewer:**
```
Mở trình duyệt → file:///c:\Users\phamt\OneDrive\Desktop\TKB-Demo\frontend\student\index.html
```

---

## 📋 Các Use Case (UC) Được Triển Khai

### ✅ Phân Hệ Quản Trị (Giáo Vụ) - Admin Dashboard

| UC # | Tên | Mô Tả | Status |
|------|-----|-------|--------|
| UC01 | Import Dữ Liệu | Tải file Excel (giáo viên, lớp, phòng, môn) | ✓ |
| UC02 | Xem Trước & Validate | Preview dữ liệu, kiểm tra lỗi, lưu thông minh (UPSERT) | ✓ |
| UC03 | Xếp Lịch Tự Động | Chạy thuật toán tối ưu hóa lập lịch | ○ Schema Ready |
| UC04 | Tinh Chỉnh Thủ Công | Kéo-thả tiết học trên ma trận | ✓ UI Ready |
| UC05 | Công Bố TKB | Công bố lịch & gửi thông báo | ✓ |
| UC06 | Duyệt Yêu Cầu | Xem danh sách, chấp thuận/từ chối đổi tiết | ✓ |

### ✅ Phân Hệ Tác Nghiệp (Giáo Viên) - Mobile App

| UC # | Tên | Mô Tả | Status |
|------|-----|-------|--------|
| UC07 | Gửi Yêu Cầu Đổi Tiết | Form chọn tiết + người thay + cam kết trách nhiệm | ✓ |
| UC08 | Tra Cứu Lịch | Xem TKB cá nhân & toàn trường | ✓ |
| UC09 | Nhận Thông Báo | Push Notification về kết quả duyệt | ✓ Schema Ready |

### ✅ Phân Hệ Tra Cứu (Học Sinh) - Student Viewer

| UC # | Tên | Mô Tả | Status |
|------|-----|-------|--------|
| UC10 | Tra Cứu Lịch Học | Xem lịch học của lớp mình | ✓ |
| UC11 | Nhận Thông Báo | Thông báo khi lịch thay đổi | ✓ UI Ready |

### ✅ Phân Hệ Quản Trị Hệ Thống - Admin

| UC # | Tên | Mô Tả | Status |
|------|-----|-------|--------|
| UC12 | Quản Lý Người Dùng | Tạo/Sửa/Xóa tài khoản, reset mật khẩu | ✓ |
| UC13 | Nhật Ký Hệ Thống | Audit log - ghi lại mọi thay đổi | ✓ |

---

## 🎬 Quy Trình Thuyết Trình

### **Demo 1: Quản Trị Dữ Liệu (5 phút)**

1. **Mở Admin Dashboard**
   - Click tab "📥 Import Dữ Liệu (UC01)"

2. **Tải File Mẫu**
   - Click "📥 Tải File Mẫu Excel"
   - Giới thiệu cấu trúc dữ liệu (Giáo Viên, Lớp, Phòng, Môn)

3. **Upload & Xem Trước (UC02)**
   - Chọn file → Upload
   - Hiển thị Preview: ✓ Hợp lệ, ✕ Lỗi
   - Giải thích cơ chế **UPSERT** (Update nếu trùng, Insert nếu mới)

4. **Lưu Dữ Liệu**
   - Click "✅ Xác Nhận Lưu Dữ Liệu"

---

### **Demo 2: Xếp Lịch (5 phút)**

1. **Mở Admin Dashboard**
   - Click tab "📅 Xếp Lịch (UC03-UC04)"

2. **Xếp Lịch Tự Động (UC03)**
   - Click "🤖 Chạy Xếp Lịch Tự Động"
   - Giải thích: Hệ thống chạy thuật toán tối ưu hoá với ràng buộc cứng/mềm

3. **Tinh Chỉnh Thủ Công (UC04)**
   - Hiển thị ma trận lịch (Lớp × Tiết × Tuần)
   - Demo: Kéo thả "Toán - P101" từ Tiết 1 sang Tiết 2
   - Giải thích: Hệ thống kiểm tra xung đột Real-time

4. **Công Bố Lịch (UC05)**
   - Click "📢 Công Bố TKB"
   - Giáo viên & học sinh nhận thông báo ngay

---

### **Demo 3: Yêu Cầu Đổi Tiết (3 phút)**

1. **Mở Teacher Mobile App**
   - Hiển thị lịch dạy của giáo viên

2. **Gửi Yêu Cầu (UC07)**
   - Click "➕ Gửi Yêu Cầu Đổi Tiết/Báo Nghỉ"
   - Form:
     - Chọn tiết
     - Chọn người dạy thay
     - Nhập lý do
     - ✓ Tick cam kết trách nhiệm
   - Click "✅ Gửi Yêu Cầu"

3. **Duyệt Yêu Cầu (UC06)**
   - Quay lại Admin Dashboard → "✍️ Duyệt Yêu Cầu (UC06)"
   - Hiển thị danh sách yêu cầu chờ duyệt
   - Click "✓ Duyệt" hoặc "✕ Từ Chối"

---

### **Demo 4: Tra Cứu Lịch (3 phút)**

1. **Mở Student Schedule Viewer**
   - Hiển thị lịch học của Lớp 10A

2. **Tra Cứu Lịch (UC10)**
   - Chọn lớp → Hiển thị bảng TKB đầy đủ
   - Giải thích: Học sinh xem được:
     - Môn học & tiết học
     - Giáo viên dạy
     - Phòng học
     - Thời gian

3. **Nhận Thông Báo (UC11)**
   - Panel "🔔 Thông Báo Gần Đây"
   - Hiển thị ví dụ: "Thay đổi lịch", "Giáo viên nghỉ"

---

## 🔒 Ràng Buộc Được Thực Thi

### **Ràng Buộc Cứng (Hard Constraints) - CHẶN**

```javascript
HC1: Trùng lịch Giáo Viên
❌ Giáo viên không thể dạy 2 lớp cùng lúc

HC2: Trùng Phòng Học  
❌ Phòng không thể chứa 2 lớp cùng lúc

HC3: Sức Chứa Phòng (Capacity)
❌ Sĩ số lớp > sức chứa phòng → LỖI

HC4: Định Mức Môn Học
❌ Tổng tiết/tuần ≠ chương trình → LỖI
```

### **Ràng Buộc Mềm (Soft Constraints) - CẢNH BÁO**

```javascript
SC1: Phân Bố Môn Học
⚠️ Nếu môn bị dồn quá nhiều tiết/ngày → CẢNH BÁO

SC2: Môn Nặng (Toán, Lý, Hóa)
⚠️ Nếu xếp vào tiết cuối ngày → CẢNH BÁO

SC3: Di Chuyển Giáo Viên
⚠️ Nếu phải di chuyển giữa 2 cơ sở trong giờ ra → CẢNH BÁO
```

---

## 💾 Cơ Sở Dữ Liệu

**Hệ QUẢN LÝ: SQLite** (`backend/data/tkb.db`)

**Các Bảng Chính:**

```sql
-- Nhân Sự
users                  -- Tài khoản đăng nhập (Admin, Giáo Viên, Học Sinh)
teachers               -- Thông tin giáo viên
students               -- Thông tin học sinh
admins                 -- Quản trị viên

-- Thời Khóa Biểu
schedule_versions      -- Phiên bản TKB (Master/Hotfix)
schedule_slots         -- Tiết học (Slot cụ thể)
classes                -- Lớp học
rooms                  -- Phòng học
subjects               -- Môn học

-- Vận Hành
change_requests        -- Yêu cầu đổi tiết/báo nghỉ
notifications          -- Thông báo
audit_logs             -- Nhật ký hệ thống
```

---

## 🌐 API Endpoints (Backend)

### Auth
```
POST   /api/auth/register    - Đăng ký người dùng
POST   /api/auth/login       - Đăng nhập
GET    /api/auth/user/:id    - Lấy thông tin user
```

### Schedule
```
GET    /api/schedule/versions                  - Danh sách phiên bản TKB
POST   /api/schedule/versions                  - Tạo phiên bản mới
GET    /api/schedule/versions/:id/slots        - Danh sách tiết học
POST   /api/schedule/slots                     - Thêm tiết (kiểm tra xung đột)
POST   /api/schedule/versions/:id/publish      - Công bố TKB
```

### Teacher
```
GET    /api/teacher/:id/schedule               - Lịch dạy cá nhân
GET    /api/teacher/all-schedules              - Toàn bộ lịch
POST   /api/teacher/change-request             - Gửi yêu cầu đổi tiết
GET    /api/teacher/:id/change-requests        - Danh sách yêu cầu
```

### Student
```
GET    /api/student/class/:classId/schedule    - Lịch học của lớp
GET    /api/student/:id/notifications          - Thông báo
PUT    /api/student/notifications/:id/read     - Đánh dấu đã đọc
```

### Admin
```
GET    /api/admin/users                        - Danh sách người dùng
POST   /api/admin/users                        - Tạo người dùng
GET    /api/admin/classes                      - Danh sách lớp
POST   /api/admin/classes                      - Tạo lớp
GET    /api/admin/rooms                        - Danh sách phòng
POST   /api/admin/rooms                        - Tạo phòng
GET    /api/admin/subjects                     - Danh sách môn
POST   /api/admin/subjects                     - Tạo môn
GET    /api/admin/change-requests              - Yêu cầu chờ duyệt
PUT    /api/admin/change-requests/:id/approve  - Duyệt yêu cầu
GET    /api/admin/audit-logs                   - Nhật ký hệ thống
```

### Import
```
POST   /api/import/upload     - Tải file Excel (UC01)
POST   /api/import/commit     - Lưu với UPSERT (UC02)
GET    /api/import/template   - Tải file mẫu
```

---

## 👥 Sample Data (Demo)

**Giáo Viên:**
- Nguyễn Văn A (Toán) - gv001
- Trần Văn B (Lý) - gv002
- Lê Văn C (Hóa) - gv003

**Lớp:**
- 10A (45 HS) - K10A
- 10B (44 HS) - K10B
- 11A (46 HS) - K11A

**Phòng:**
- P101-P106 (Khối 10)
- P201-P206 (Khối 11)

**Môn:**
- Toán (18 tiết/tuần) - Độ khó cao
- Văn (12 tiết/tuần)
- Lý (12 tiết/tuần) - Độ khó cao
- ...

---

## 🎨 Giao Diện Demo

### Admin Dashboard
- 📊 **Dashboard**: Tổng quan KPI
- 📥 **Import**: Upload & validate dữ liệu
- 📅 **Xếp Lịch**: Ma trận kéo-thả
- ✉️ **Duyệt Yêu Cầu**: Danh sách chờ duyệt
- 👥 **Quản Lý User**: CRUD người dùng
- 📋 **Audit Log**: Nhật ký thay đổi

### Teacher Mobile App
- 📅 **Lịch Dạy**: Tuần/Ngày
- ✍️ **Gửi Yêu Cầu**: Form báo nghỉ/đổi tiết
- 🔔 **Thông Báo**: Kết quả duyệt

### Student Viewer
- 📚 **Lịch Học**: Bảng TKB
- 🔔 **Thông Báo**: Thay đổi lịch

---

## 🎯 Key Features Tóm Tắt

✅ **Import thông minh (UPSERT)** - Lưu nhanh, xóa lỗi dễ dàng
✅ **Kiểm tra xung đột Real-time** - HC1, HC2, HC3 tự động
✅ **Giao diện Kéo-Thả** - Tinh chỉnh lịch dễ dàng
✅ **Yêu cầu đổi tiết** - Form tối giản (<3 bước chạm)
✅ **Thông báo đa kênh** - App/Email/Zalo (sẵn sàng)
✅ **Audit Log đầy đủ** - Compliance & truy vết
✅ **Mobile-first** - Học sinh/Giáo viên dùng dễ dàng

---

## 📞 Liên Hệ / Hỗ Trợ

**Backend Server:** http://localhost:3001
**Health Check:** http://localhost:3001/api/health
**Cơ sở dữ liệu:** SQLite3 (backend/data/tkb.db)

---

## 📚 Tài Liệu Tham Khảo

- Tài liệu SRS (Software Requirements Specification)
- Tài liệu URD (User Requirements Document)
- IEEE Standard 830-1998
- UML Use Case & Class Diagrams

---

**Happy Presenting! 🎉**
