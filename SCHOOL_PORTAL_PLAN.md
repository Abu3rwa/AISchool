# School Portal Implementation Plan

## Overview
Build a complete school management portal where:
- **ADMIN** (school admin) can manage all data within their tenant
- **TEACHER** can only access classes/subjects/students/grades/attendance they are assigned to via `ClassSubject`

---

## Data Models

### 1. `Student`
| Field | Type | Notes |
|-------|------|-------|
| `tenantId` | ObjectId | Required, indexed |
| `classId` | ObjectId | Reference to `Class` (simple membership) |
| `firstName` | String | Required |
| `lastName` | String | Required |
| `studentIdNumber` | String | Optional, tenant-unique |
| `email` | String | Optional, student's email (for notifications) |
| `gender` | String | Optional (M/F/Other) |
| `dateOfBirth` | Date | Optional |
| `guardianName` | String | Optional (primary guardian) |
| `guardianEmail` | String | **Required for notifications** — parent/guardian email |
| `guardianPhone` | String | Optional |
| `secondaryGuardianName` | String | Optional (second guardian) |
| `secondaryGuardianEmail` | String | Optional (second guardian email) |
| `secondaryGuardianPhone` | String | Optional |
| `notificationPreferences` | Object | `{ gradeUpdates: true, attendance: true, reports: true }` |
| `isActive` | Boolean | Default true |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

**Email usage:**
- `email` — student's own email (older students may have one)
- `guardianEmail` — **primary contact** for grade notifications, reports, attendance alerts
- `secondaryGuardianEmail` — optional second parent/guardian
- When sending notifications, system sends to all available emails based on `notificationPreferences`

### 2. `Class`
| Field | Type | Notes |
|-------|------|-------|
| `tenantId` | ObjectId | Required, indexed |
| `name` | String | Required (e.g., "Grade 10A") |
| `gradeLevel` | String | Optional (e.g., "10") |
| `section` | String | Optional (e.g., "A") |
| `academicYear` | String | Optional (e.g., "2025-2026") |
| `isActive` | Boolean | Default true |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### 3. `Subject`
| Field | Type | Notes |
|-------|------|-------|
| `tenantId` | ObjectId | Required, indexed |
| `name` | String | Required (e.g., "Mathematics") |
| `code` | String | Optional (e.g., "MATH101") |
| `isActive` | Boolean | Default true |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### 4. `ClassSubject` (Assignment Layer - CRITICAL)
| Field | Type | Notes |
|-------|------|-------|
| `tenantId` | ObjectId | Required, indexed |
| `classId` | ObjectId | Reference to `Class` |
| `subjectId` | ObjectId | Reference to `Subject` |
| `teacherId` | ObjectId | Reference to `User` (role=TEACHER) |
| `createdAt` | Date | Auto |

**Indexes:**
- Unique: `(tenantId, classId, subjectId)` — one teacher per class+subject
- Query: `(tenantId, teacherId)` — fast "my assignments" lookup

### 5. `User` (existing, extended)
Teachers are created as `User` documents with:
- `tenantId`
- `firstName`, `lastName`, `email` (tenant-scoped unique)
- `password` (bcrypt hash of temp password)
- `roles` = [TEACHER role ObjectId]
- `isActive`

---

## RBAC Rules

### Role: ADMIN
- Full CRUD on all tenant data
- Can create/update/deactivate teachers
- Can assign teachers to class+subject via `ClassSubject`
- Can reset teacher passwords

### Role: TEACHER
- **Read-only** on their own assignments
- Can only access:
  - Classes where they have at least one `ClassSubject` assignment
  - Subjects where they are assigned (per class)
  - Students in those classes
  - Grades/Attendance for their assigned class+subject pairs
- **Cannot** see other teachers' classes/subjects/students

---

## Teacher Scoping Logic (Controller Pattern)

### Helper: Get teacher's allowed class IDs
```js
const getTeacherClassIds = async (tenantId, teacherId) => {
  return ClassSubject.distinct('classId', { tenantId, teacherId });
};
```

### Helper: Check teacher assignment
```js
const requireTeacherAssignment = async (req, classId, subjectId) => {
  if (isAdmin(req.user)) return true;
  
  const assigned = await ClassSubject.exists({
    tenantId: req.user.tenantId,
    classId,
    subjectId,
    teacherId: req.user._id
  });
  
  if (!assigned) throw new ForbiddenError('Not assigned to this class/subject');
  return true;
};
```

### Helper: Check teacher has any assignment in class
```js
const requireTeacherClassAccess = async (req, classId) => {
  if (isAdmin(req.user)) return true;
  
  const assigned = await ClassSubject.exists({
    tenantId: req.user.tenantId,
    classId,
    teacherId: req.user._id
  });
  
  if (!assigned) throw new ForbiddenError('Not assigned to this class');
  return true;
};
```

---

## API Endpoints

### Authentication (existing)
- `POST /api/auth/login` — school user login (admin or teacher)
- `GET /api/auth/me` — get current user with roles

### Teachers (ADMIN only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portal/teachers` | List all teachers in tenant |
| POST | `/api/portal/teachers` | Create teacher (returns temp password once) |
| GET | `/api/portal/teachers/:id` | Get teacher details |
| PUT | `/api/portal/teachers/:id` | Update teacher info |
| PATCH | `/api/portal/teachers/:id/status` | Activate/deactivate |
| POST | `/api/portal/teachers/:id/reset-password` | Reset password (returns temp password once) |

### Students
| Method | Endpoint | Description | TEACHER access |
|--------|----------|-------------|----------------|
| GET | `/api/portal/students` | List students (filter by classId) | Only if assigned to classId |
| POST | `/api/portal/students` | Create student | ADMIN only |
| GET | `/api/portal/students/:id` | Get student details | Only if student.classId is assigned |
| PUT | `/api/portal/students/:id` | Update student | ADMIN only |
| PATCH | `/api/portal/students/:id/status` | Activate/deactivate | ADMIN only |

### Classes
| Method | Endpoint | Description | TEACHER access |
|--------|----------|-------------|----------------|
| GET | `/api/portal/classes` | List classes | Only assigned classes |
| POST | `/api/portal/classes` | Create class | ADMIN only |
| GET | `/api/portal/classes/:id` | Get class details | Only if assigned |
| PUT | `/api/portal/classes/:id` | Update class | ADMIN only |
| PATCH | `/api/portal/classes/:id/status` | Activate/deactivate | ADMIN only |

### Subjects
| Method | Endpoint | Description | TEACHER access |
|--------|----------|-------------|----------------|
| GET | `/api/portal/subjects` | List subjects | Only assigned subjects |
| POST | `/api/portal/subjects` | Create subject | ADMIN only |
| GET | `/api/portal/subjects/:id` | Get subject details | Only if assigned |
| PUT | `/api/portal/subjects/:id` | Update subject | ADMIN only |
| PATCH | `/api/portal/subjects/:id/status` | Activate/deactivate | ADMIN only |

### Class-Subject Assignments (ADMIN only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portal/class-subjects` | List all assignments (filter by classId, teacherId) |
| POST | `/api/portal/class-subjects` | Assign teacher to class+subject |
| DELETE | `/api/portal/class-subjects/:id` | Remove assignment |

### Teacher Self-View
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portal/my/assignments` | Get my ClassSubject assignments |
| GET | `/api/portal/my/classes` | Get my assigned classes |
| GET | `/api/portal/my/subjects?classId=...` | Get my subjects for a class |

### Grades (future)
| Method | Endpoint | Description | TEACHER access |
|--------|----------|-------------|----------------|
| GET | `/api/portal/grades` | List grades (filter by classId, subjectId, studentId) | Only assigned class+subject |
| POST | `/api/portal/grades` | Create/update grade | Only assigned class+subject |

### Attendance (future)
| Method | Endpoint | Description | TEACHER access |
|--------|----------|-------------|----------------|
| GET | `/api/portal/attendance` | List attendance records | Only assigned class+subject |
| POST | `/api/portal/attendance` | Record attendance | Only assigned class+subject |

---

## Implementation Order

### Phase 1: Foundation (Students + Teachers)
1. Create `Student` model
2. Create student controller + routes (ADMIN only for now)
3. Create teacher controller + routes (ADMIN only)
   - Create teacher = create User with role TEACHER + temp password
   - Reset password endpoint
4. Create client pages:
   - `/portal/students` — list, create, edit, deactivate
   - `/portal/teachers` — list, create, edit, deactivate, reset password

### Phase 2: Classes + Subjects
1. Create `Class` model
2. Create `Subject` model
3. Create class controller + routes
4. Create subject controller + routes
5. Create client pages:
   - `/portal/classes` — list, create, edit, deactivate
   - `/portal/subjects` — list, create, edit, deactivate

### Phase 3: Assignment Layer + Scoping
1. Create `ClassSubject` model
2. Create class-subject controller + routes (ADMIN only)
3. Add teacher scoping helpers
4. Update all portal controllers to enforce RBAC:
   - Students: filter by teacher's assigned classIds
   - Classes: filter by teacher's assignments
   - Subjects: filter by teacher's assignments
5. Create client pages:
   - `/portal/classes/:id/assignments` — assign teachers to subjects
   - `/portal/my/dashboard` — teacher's assigned classes/subjects

### Phase 4: Grades + Attendance
1. Create `Grade` model
2. Create `Attendance` model
3. Create grade controller + routes (with teacher scoping)
4. Create attendance controller + routes (with teacher scoping)
5. Create client pages:
   - `/portal/grades` — grade entry by class+subject
   - `/portal/attendance` — attendance marking

### Phase 5: Reports + Polish
1. Report generation endpoints
2. Dashboard metrics
3. UI polish

---

## File Structure (Backend)

```
src/
├── models/
│   ├── Student.js
│   ├── Class.js
│   ├── Subject.js
│   ├── ClassSubject.js
│   ├── Grade.js (future)
│   └── Attendance.js (future)
├── controllers/
│   ├── studentController.js
│   ├── teacherController.js
│   ├── classController.js
│   ├── subjectController.js
│   ├── classSubjectController.js
│   ├── gradeController.js (future)
│   └── attendanceController.js (future)
├── routes/
│   ├── studentRoutes.js
│   ├── teacherRoutes.js
│   ├── classRoutes.js
│   ├── subjectRoutes.js
│   ├── classSubjectRoutes.js
│   ├── myRoutes.js (teacher self-view)
│   ├── gradeRoutes.js (future)
│   └── attendanceRoutes.js (future)
├── middleware/
│   ├── authMiddleware.js (existing)
│   └── rbacMiddleware.js (role checks)
└── helpers/
    └── teacherScoping.js (getTeacherClassIds, requireTeacherAssignment, etc.)
```

---

## File Structure (Client)

```
client/src/pages/school/
├── dashboard/
│   └── SchoolDashboardPage.jsx
├── students/
│   └── StudentsPage.jsx
├── teachers/
│   └── TeachersPage.jsx
├── classes/
│   ├── ClassesPage.jsx
│   └── ClassDetailsPage.jsx (roster + assignments)
├── subjects/
│   └── SubjectsPage.jsx
├── grades/ (future)
│   └── GradesPage.jsx
├── attendance/ (future)
│   └── AttendancePage.jsx
└── my/ (teacher view)
    ├── MyClassesPage.jsx
    └── MyDashboardPage.jsx
```

---

## Security Checklist

- [ ] All portal routes require authentication (`authMiddleware`)
- [ ] All write operations require `ADMIN` role (except teacher's own grade/attendance entries)
- [ ] All teacher queries filter by `ClassSubject.teacherId`
- [ ] Temp passwords are returned only once (never stored in plain text)
- [ ] Passwords are bcrypt hashed
- [ ] All queries include `tenantId` filter (no cross-tenant leaks)

---

## Notes

- **No services layer** — all logic in controllers (per user preference)
- **Simple student→class membership** — `Student.classId` (not a join table)
- **Option A scoping** — teacher access is per `ClassSubject` (class+subject+teacher)
