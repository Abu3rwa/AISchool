# Grade System Implementation Plan

## Overview
Build a comprehensive grade entry and reporting system where:
- **ADMIN** can view all grades across the school
- **TEACHER** can only create/edit grades for students in their assigned class+subject
- **STUDENT/PARENT** can read-only view their own grades
- Grades are structured for **AI-powered report generation** later

---

## Data Models

### 1. `GradeType` (Lookup Table)
Defines the types of assessments (configurable per tenant).

| Field | Type | Notes |
|-------|------|-------|
| `tenantId` | ObjectId | Required, indexed |
| `name` | String | Required (e.g., "Classwork", "Test", "Exam", "Quiz", "Homework", "Project") |
| `weight` | Number | Optional, percentage weight for final grade calculation (e.g., 0.1 = 10%) |
| `maxScore` | Number | Optional, default max score for this type (e.g., 100) |
| `isActive` | Boolean | Default true |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

**Default seed data per tenant:**
- Classwork (weight: 0.20)
- Homework (weight: 0.10)
- Quiz (weight: 0.15)
- Test (weight: 0.25)
- Exam (weight: 0.30)

### 2. `Grade` (Core Grade Entry)
Each grade entry represents one assessment score for one student.

| Field | Type | Notes |
|-------|------|-------|
| `tenantId` | ObjectId | Required, indexed |
| `studentId` | ObjectId | Reference to `Student`, required |
| `classId` | ObjectId | Reference to `Class`, required (denormalized for queries) |
| `subjectId` | ObjectId | Reference to `Subject`, required |
| `teacherId` | ObjectId | Reference to `User` (teacher who entered), required |
| `gradeTypeId` | ObjectId | Reference to `GradeType`, required |
| `title` | String | Optional, assessment title (e.g., "Chapter 5 Test") |
| `score` | Number | Required, actual score achieved |
| `maxScore` | Number | Required, maximum possible score (e.g., 100) |
| `percentage` | Number | Computed: `(score / maxScore) * 100` |
| `letterGrade` | String | Optional, computed (A, B, C, D, F) based on tenant grading scale |
| `teacherNotes` | String | Optional, private notes for teacher/admin |
| `studentFeedback` | String | Optional, feedback visible to student/parent |
| `assessmentDate` | Date | Required, when the assessment was given |
| `termId` | ObjectId | Optional, reference to `Term` (for term-based reporting) |
| `isPublished` | Boolean | Default false, if true → visible to student/parent |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

**Indexes:**
- Query: `(tenantId, studentId, subjectId)` — student's grades per subject
- Query: `(tenantId, classId, subjectId, gradeTypeId)` — class grades by type
- Query: `(tenantId, teacherId)` — teacher's entered grades
- Query: `(tenantId, assessmentDate)` — date range queries

### 3. `Term` (Academic Period - Optional but Recommended)
For organizing grades by academic terms/semesters.

| Field | Type | Notes |
|-------|------|-------|
| `tenantId` | ObjectId | Required, indexed |
| `name` | String | Required (e.g., "Term 1", "Semester 1", "Q1") |
| `startDate` | Date | Required |
| `endDate` | Date | Required |
| `academicYear` | String | Required (e.g., "2025-2026") |
| `isCurrent` | Boolean | Default false, only one term should be current |
| `isActive` | Boolean | Default true |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### 4. `GradingScale` (Tenant Configuration)
Defines letter grade boundaries per tenant.

| Field | Type | Notes |
|-------|------|-------|
| `tenantId` | ObjectId | Required, unique per tenant |
| `scales` | Array | Array of `{ letter, minPercentage, maxPercentage, gpa }` |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

**Default scale:**
```json
[
  { "letter": "A+", "minPercentage": 97, "maxPercentage": 100, "gpa": 4.0 },
  { "letter": "A", "minPercentage": 93, "maxPercentage": 96, "gpa": 4.0 },
  { "letter": "A-", "minPercentage": 90, "maxPercentage": 92, "gpa": 3.7 },
  { "letter": "B+", "minPercentage": 87, "maxPercentage": 89, "gpa": 3.3 },
  { "letter": "B", "minPercentage": 83, "maxPercentage": 86, "gpa": 3.0 },
  { "letter": "B-", "minPercentage": 80, "maxPercentage": 82, "gpa": 2.7 },
  { "letter": "C+", "minPercentage": 77, "maxPercentage": 79, "gpa": 2.3 },
  { "letter": "C", "minPercentage": 73, "maxPercentage": 76, "gpa": 2.0 },
  { "letter": "C-", "minPercentage": 70, "maxPercentage": 72, "gpa": 1.7 },
  { "letter": "D+", "minPercentage": 67, "maxPercentage": 69, "gpa": 1.3 },
  { "letter": "D", "minPercentage": 63, "maxPercentage": 66, "gpa": 1.0 },
  { "letter": "D-", "minPercentage": 60, "maxPercentage": 62, "gpa": 0.7 },
  { "letter": "F", "minPercentage": 0, "maxPercentage": 59, "gpa": 0.0 }
]
```

---

## RBAC Rules

### Role: ADMIN
- Full CRUD on all grades within tenant
- Can view all students' grades
- Can publish/unpublish grades
- Can manage grade types, terms, grading scale

### Role: TEACHER
- **Create/Edit/Delete** grades only for:
  - Students in classes they are assigned to (`ClassSubject.teacherId = user._id`)
  - Subjects they are assigned to teach
- **Read** only their own entered grades
- **Cannot** see other teachers' grades
- **Cannot** publish grades (ADMIN only) — OR allow teacher to publish their own

### Role: STUDENT
- **Read-only** access to their own grades where `isPublished = true`
- Can see: score, percentage, letterGrade, studentFeedback
- **Cannot** see: teacherNotes

### Role: PARENT
- **Read-only** access to their linked student's grades where `isPublished = true`
- Same visibility as STUDENT

---

## Teacher Scoping Logic

### Before creating/editing a grade, verify:
```js
const canTeacherGradeStudent = async (req, studentId, classId, subjectId) => {
  if (isAdmin(req.user)) return true;
  
  // 1. Verify teacher is assigned to this class+subject
  const assigned = await ClassSubject.exists({
    tenantId: req.user.tenantId,
    classId,
    subjectId,
    teacherId: req.user._id
  });
  if (!assigned) throw new ForbiddenError('Not assigned to this class/subject');
  
  // 2. Verify student belongs to this class
  const student = await Student.findOne({
    _id: studentId,
    tenantId: req.user.tenantId,
    classId
  });
  if (!student) throw new ForbiddenError('Student not in this class');
  
  return true;
};
```

### When listing grades for teacher:
```js
const getTeacherGrades = async (req, filters) => {
  // Get teacher's assigned class+subject pairs
  const assignments = await ClassSubject.find({
    tenantId: req.user.tenantId,
    teacherId: req.user._id
  });
  
  const allowedPairs = assignments.map(a => ({
    classId: a.classId,
    subjectId: a.subjectId
  }));
  
  // Build query with $or for each allowed pair
  return Grade.find({
    tenantId: req.user.tenantId,
    $or: allowedPairs.map(p => ({ classId: p.classId, subjectId: p.subjectId })),
    ...filters
  });
};
```

---

## API Endpoints

### Grade Types (ADMIN only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portal/grade-types` | List all grade types |
| POST | `/api/portal/grade-types` | Create grade type |
| PUT | `/api/portal/grade-types/:id` | Update grade type |
| DELETE | `/api/portal/grade-types/:id` | Deactivate grade type |

### Terms (ADMIN only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portal/terms` | List all terms |
| POST | `/api/portal/terms` | Create term |
| PUT | `/api/portal/terms/:id` | Update term |
| PATCH | `/api/portal/terms/:id/current` | Set as current term |

### Grading Scale (ADMIN only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portal/grading-scale` | Get tenant's grading scale |
| PUT | `/api/portal/grading-scale` | Update grading scale |

### Grades (Core)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/portal/grades` | List grades with filters | ADMIN: all, TEACHER: assigned only |
| POST | `/api/portal/grades` | Create grade entry | ADMIN or assigned TEACHER |
| POST | `/api/portal/grades/bulk` | Bulk create grades (same assessment, multiple students) | ADMIN or assigned TEACHER |
| GET | `/api/portal/grades/:id` | Get single grade | ADMIN or owner TEACHER |
| PUT | `/api/portal/grades/:id` | Update grade | ADMIN or owner TEACHER |
| DELETE | `/api/portal/grades/:id` | Delete grade | ADMIN or owner TEACHER |
| PATCH | `/api/portal/grades/:id/publish` | Publish grade (make visible to student) | ADMIN only (or owner TEACHER) |

### Grade Queries (Filtered Views)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/portal/grades/by-class/:classId` | All grades for a class | ADMIN or assigned TEACHER |
| GET | `/api/portal/grades/by-student/:studentId` | All grades for a student | ADMIN, assigned TEACHER, or self/parent |
| GET | `/api/portal/grades/by-subject/:subjectId` | All grades for a subject | ADMIN or assigned TEACHER |

### Grade Query Parameters
All grade list endpoints support these filters:
- `classId` — filter by class
- `subjectId` — filter by subject
- `studentId` — filter by student
- `gradeTypeId` — filter by type (Classwork, Test, etc.)
- `termId` — filter by term
- `startDate` / `endDate` — filter by assessment date range
- `isPublished` — filter by publish status
- `teacherId` — filter by teacher who entered (ADMIN only)

### Student/Parent Grade View
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portal/my/grades` | Student's own grades (published only) |
| GET | `/api/portal/my/grades/summary` | Student's grade summary by subject |
| GET | `/api/portal/parent/students/:studentId/grades` | Parent view of linked student's grades |

---

## Grade Summary & Reports (AI-Ready)

### Summary Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portal/grades/summary/student/:studentId` | Student's weighted average per subject |
| GET | `/api/portal/grades/summary/class/:classId` | Class average per subject |
| GET | `/api/portal/grades/summary/class/:classId/subject/:subjectId` | Detailed class performance for one subject |

### Summary Response Structure (for AI reports)
```json
{
  "studentId": "...",
  "studentName": "John Doe",
  "termId": "...",
  "termName": "Term 1",
  "subjects": [
    {
      "subjectId": "...",
      "subjectName": "Mathematics",
      "teacherName": "Mr. Smith",
      "grades": [
        {
          "gradeTypeId": "...",
          "gradeTypeName": "Classwork",
          "count": 5,
          "averageScore": 85.2,
          "averagePercentage": 85.2,
          "weight": 0.20
        },
        {
          "gradeTypeId": "...",
          "gradeTypeName": "Test",
          "count": 2,
          "averageScore": 78.5,
          "averagePercentage": 78.5,
          "weight": 0.25
        }
      ],
      "weightedAverage": 82.4,
      "letterGrade": "B-",
      "trend": "improving", // computed from date-ordered grades
      "strengths": ["Classwork", "Homework"],
      "areasForImprovement": ["Tests"]
    }
  ],
  "overallGPA": 3.2,
  "overallAverage": 81.5,
  "attendanceRate": 95.2, // if attendance data available
  "aiReportData": {
    // Structured data optimized for AI report generation
    "performanceTrend": "stable",
    "topSubjects": ["English", "Science"],
    "challengingSubjects": ["Mathematics"],
    "recommendations": [] // AI will fill this
  }
}
```

---

## Grade Notifications (Teacher → Student/Parent)

### Notification Triggers
Teachers can send grade updates/notifications:

| Trigger | Description |
|---------|-------------|
| Single grade published | Notify student/parent of new grade |
| Bulk grades published | Notify all affected students/parents |
| Term report ready | Notify when term grades are finalized |

### Notification Endpoint
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/portal/grades/notify` | Send grade notification |

### Notification Request Body
```json
{
  "type": "grade_update", // or "term_report", "custom"
  "filters": {
    "classId": "...",
    "subjectId": "...",
    "gradeTypeId": "...", // optional
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "message": "Optional custom message from teacher",
  "channels": ["in_app", "email", "sms"] // configurable per tenant
}
```

---

## Implementation Order

### Phase 1: Core Grade Entry
1. Create `GradeType` model + seed default types
2. Create `Grade` model
3. Create `Term` model
4. Create grade controller with teacher scoping
5. Create grade routes
6. Client: Grade entry page for teachers

### Phase 2: Grade Management UI
1. Client: `/portal/grades` — teacher's grade list with filters
2. Client: Grade entry form (single + bulk)
3. Client: Grade edit/delete
4. Client: Publish toggle (ADMIN)

### Phase 3: Student/Parent View
1. Create student grade view endpoints
2. Create parent grade view endpoints
3. Client: `/portal/my/grades` — student view
4. Client: Parent dashboard with student grades

### Phase 4: Summaries & Reports
1. Create summary calculation helpers
2. Create summary endpoints
3. Client: Grade summary dashboard
4. Client: Printable report card view

### Phase 5: AI Report Integration
1. Structure grade data for AI consumption
2. Create AI report generation endpoint
3. Integrate with AI service (OpenAI, etc.)
4. Client: AI-generated report view

### Phase 6: Notifications
1. Create notification model
2. Create notification service
3. Integrate with grade publish flow
4. Client: Notification preferences

---

## File Structure (Backend)

```
src/
├── models/
│   ├── GradeType.js
│   ├── Grade.js
│   ├── Term.js
│   └── GradingScale.js
├── controllers/
│   ├── gradeTypeController.js
│   ├── gradeController.js
│   ├── termController.js
│   ├── gradingScaleController.js
│   └── gradeSummaryController.js
├── routes/
│   ├── gradeTypeRoutes.js
│   ├── gradeRoutes.js
│   ├── termRoutes.js
│   ├── gradingScaleRoutes.js
│   └── gradeSummaryRoutes.js
└── helpers/
    ├── gradeCalculations.js (weighted averages, letter grades)
    └── teacherScoping.js (existing, extended)
```

---

## File Structure (Client)

```
client/src/pages/school/
├── grades/
│   ├── GradesPage.jsx (teacher's grade list)
│   ├── GradeEntryPage.jsx (single/bulk entry)
│   ├── GradeEditModal.jsx
│   └── components/
│       ├── GradeFilters.jsx
│       ├── GradeTable.jsx
│       └── BulkGradeForm.jsx
├── grade-types/
│   └── GradeTypesPage.jsx (ADMIN)
├── terms/
│   └── TermsPage.jsx (ADMIN)
├── reports/
│   ├── StudentReportPage.jsx
│   ├── ClassReportPage.jsx
│   └── AIReportPage.jsx (future)
└── my/
    └── MyGradesPage.jsx (student view)
```

---

## Security Checklist

- [ ] All grade routes require authentication
- [ ] Teacher can only create grades for assigned class+subject+student
- [ ] Teacher can only edit/delete their own grades
- [ ] Student/Parent can only see published grades
- [ ] Student/Parent cannot see teacherNotes field
- [ ] All queries include tenantId filter
- [ ] Bulk operations validate all students belong to teacher's class

---

## Data Isolation Rules (Multi-Tenant)

### Tenant Isolation (CRITICAL)
Every query MUST include `tenantId` from `req.user.tenantId`:

```js
// ✅ CORRECT - Always filter by tenantId
const grades = await Grade.find({ tenantId: req.user.tenantId, ...filters });

// ❌ WRONG - Never query without tenantId
const grades = await Grade.find({ studentId }); // SECURITY RISK
```

### Model-Level Isolation
| Model | Isolation Key | Notes |
|-------|---------------|-------|
| `Grade` | `tenantId` | All grades belong to one tenant |
| `GradeType` | `tenantId` | Each tenant has own grade types |
| `Term` | `tenantId` | Each tenant has own terms |
| `GradingScale` | `tenantId` | Unique per tenant |
| `Student` | `tenantId` | Students belong to one tenant |
| `ClassSubject` | `tenantId` | Assignments are tenant-scoped |

### Query Patterns by Role

**ADMIN queries:**
```js
// Admin sees all within their tenant
Grade.find({ tenantId: req.user.tenantId, ...filters });
```

**TEACHER queries:**
```js
// Teacher sees only their assigned class+subject pairs
const assignments = await ClassSubject.find({
  tenantId: req.user.tenantId,
  teacherId: req.user._id
});
const allowedPairs = assignments.map(a => ({ classId: a.classId, subjectId: a.subjectId }));

Grade.find({
  tenantId: req.user.tenantId,
  $or: allowedPairs
});
```

**STUDENT queries:**
```js
// Student sees only their own published grades
Grade.find({
  tenantId: req.user.tenantId,
  studentId: req.user.studentId, // linked student record
  isPublished: true
}).select('-teacherNotes'); // Exclude private notes
```

**PARENT queries:**
```js
// Parent sees only linked children's published grades
const linkedStudents = await getParentLinkedStudents(req.user._id);
Grade.find({
  tenantId: req.user.tenantId,
  studentId: { $in: linkedStudents },
  isPublished: true
}).select('-teacherNotes');
```

### Cross-Reference Validation
When creating/updating grades, validate all referenced IDs belong to the same tenant:

```js
const validateGradeReferences = async (tenantId, { studentId, classId, subjectId, gradeTypeId, termId }) => {
  // All must exist AND belong to the same tenant
  const [student, classDoc, subject, gradeType, term] = await Promise.all([
    Student.findOne({ _id: studentId, tenantId, deleted: false }),
    Class.findOne({ _id: classId, tenantId, deleted: false }),
    Subject.findOne({ _id: subjectId, tenantId, deleted: false }),
    GradeType.findOne({ _id: gradeTypeId, tenantId, isActive: true }),
    termId ? Term.findOne({ _id: termId, tenantId, isActive: true }) : Promise.resolve(true)
  ]);

  if (!student) throw new Error('Student not found');
  if (!classDoc) throw new Error('Class not found');
  if (!subject) throw new Error('Subject not found');
  if (!gradeType) throw new Error('Grade type not found');
  if (termId && !term) throw new Error('Term not found');

  // Verify student belongs to the class
  if (student.classId?.toString() !== classId.toString()) {
    throw new Error('Student does not belong to this class');
  }

  return true;
};
```

### Middleware Enforcement
Add tenant isolation middleware to all portal routes:

```js
// portalAuthMiddleware.js
const ensureTenantContext = (req, res, next) => {
  if (!req.user?.tenantId) {
    return res.status(403).json({ message: 'No tenant context' });
  }
  next();
};

// Apply to all /api/portal/* routes
router.use('/portal', authMiddleware, ensureTenantContext);
```

### Index Strategy for Isolation
All compound indexes should start with `tenantId`:

```js
// Grade model indexes
GradeSchema.index({ tenantId: 1, studentId: 1, subjectId: 1 });
GradeSchema.index({ tenantId: 1, classId: 1, subjectId: 1, gradeTypeId: 1 });
GradeSchema.index({ tenantId: 1, teacherId: 1 });
GradeSchema.index({ tenantId: 1, assessmentDate: 1 });
```

### Audit Trail (Optional but Recommended)
Track who accessed/modified grades:

```js
// Grade model
{
  createdBy: { type: ObjectId, ref: 'User' },
  updatedBy: { type: ObjectId, ref: 'User' },
  accessLog: [{
    userId: ObjectId,
    action: String, // 'view', 'create', 'update', 'delete'
    timestamp: Date,
    ip: String
  }]
}
```

---

## AI Report Data Structure

For future AI integration, each grade summary will include structured data:

```json
{
  "studentProfile": {
    "id": "...",
    "name": "John Doe",
    "class": "Grade 10A",
    "academicYear": "2025-2026"
  },
  "termPerformance": {
    "term": "Term 1",
    "subjects": [
      {
        "name": "Mathematics",
        "teacher": "Mr. Smith",
        "gradeBreakdown": {
          "classwork": { "average": 85, "count": 5, "trend": "stable" },
          "homework": { "average": 90, "count": 8, "trend": "improving" },
          "quizzes": { "average": 75, "count": 3, "trend": "declining" },
          "tests": { "average": 72, "count": 2, "trend": "stable" },
          "exams": { "average": 68, "count": 1, "trend": null }
        },
        "finalGrade": "C+",
        "weightedAverage": 76.5,
        "classRank": 15,
        "classSize": 30,
        "percentile": 50
      }
    ],
    "overallGPA": 2.8,
    "attendance": {
      "present": 45,
      "absent": 3,
      "late": 2,
      "rate": 94
    }
  },
  "historicalTrend": {
    "previousTerms": [
      { "term": "Term 3 (2024-2025)", "gpa": 2.5 },
      { "term": "Term 2 (2024-2025)", "gpa": 2.3 }
    ],
    "improvement": true
  },
  "aiPromptContext": {
    "strengths": ["Consistent homework completion", "Good classwork participation"],
    "challenges": ["Test anxiety", "Exam preparation"],
    "teacherComments": [
      { "subject": "Mathematics", "comment": "Shows effort but struggles with problem-solving under pressure" }
    ]
  }
}
```

This structure enables AI to generate personalized, insightful reports for each student.

---

## Notes

- **No services layer** — all logic in controllers
- **Teacher scoping via ClassSubject** — consistent with main portal plan
- **Grades are tenant-isolated** — no cross-tenant data leaks
- **Published flag** — controls student/parent visibility
- **AI-ready structure** — grade summaries designed for LLM consumption
