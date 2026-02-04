# Complete GradeBooking SaaS Implementation Plan

## Architecture Overview

This is a **multi-tenant school management SaaS** built with:

- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with tenant isolation
- **Pattern**: MVC with Routes → Controllers → Services → Models

### Current State Analysis

**Completed:**

- ✅ All 18 Mongoose models with proper schemas, indexes, and tenant isolation
- ✅ Database connection setup (`src/db.js`)
- ✅ Basic authentication (register, login, JWT middleware)
- ✅ User and Tenant CRUD operations fully implemented
- ✅ Server setup with all routes mounted
- ✅ **Phase 1: Foundation & Security - COMPLETE**
- ✅ **Phase 2: Core Services Implementation - COMPLETE**
- ✅ **Phase 3.1 & 3.2: Fee and Payment Services - COMPLETE**

**In Progress:**

- 🔄 Payment Controller implementation needed
- 🔄 Payment Routes need auth middleware

**Incomplete:**

- ❌ Phase 3.3 & 3.4: Term Report and AI Report Request Services
- ❌ Phase 4: Supporting Services (Behavior Records, Notifications, Assets, Provider)
- ❌ Phase 5: Audit & Logging
- ❌ Phase 6.2: RBAC Middleware application to routes
- ❌ Phase 7: Validation & Error Handling (validation schemas)
- ❌ Phase 8: Additional Features
- ❌ Phase 9: Testing & Documentation

## Implementation Plan

### Phase 1: Foundation & Security ✅ COMPLETE

#### 1.1 Fix Authentication Service ✅

**File**: `src/services/authService.js`

- ✅ Fixed role assignment to use ObjectId references
- ✅ Created default roles for new tenants (Admin, Teacher, Student)
- ✅ Added proper error handling for duplicate emails/tenants
- ✅ Enhanced registration to create default roles automatically

#### 1.2 Enhance Auth Middleware ✅

**File**: `src/middleware/authMiddleware.js`

- ✅ Added tenant status check (active/inactive/suspended)
- ✅ Added token expiration handling
- ✅ Added user active status check

#### 1.3 Create RBAC Middleware ✅

**New File**: `src/middleware/rbacMiddleware.js`

- ✅ Created `requirePermission()` middleware
- ✅ Created `requireRole()` middleware
- ✅ Supports permission strings and role names
- ✅ Supports multiple permissions (OR logic)

#### 1.4 Create Tenant Isolation Middleware ✅

**New File**: `src/middleware/tenantMiddleware.js`

- ✅ Validates tenant status before processing requests
- ✅ Prevents tenantId override in request body
- ✅ Attaches tenant info to request

#### 1.5 Create Input Validation Middleware ✅

**New File**: `src/middleware/validationMiddleware.js`

- ✅ Created validation middleware using express-validator
- ✅ Ready for validation schemas to be added

#### 1.6 Create Error Handling Middleware ✅

**New File**: `src/middleware/errorHandler.js`

- ✅ Centralized error handling
- ✅ Handles Mongoose validation errors
- ✅ Handles duplicate key errors
- ✅ Handles JWT errors
- ✅ Integrated into `server.js`

### Phase 2: Core Services Implementation ✅ COMPLETE

#### 2.1 Role Service & Controller ✅

**Files**: `src/services/roleService.js`, `src/controllers/roleController.js`, `src/routes/roleRoutes.js`

- ✅ CRUD operations with tenant isolation
- ✅ Create default roles on tenant creation
- ✅ Prevent deletion of default roles
- ✅ Auth middleware and RBAC applied to routes

#### 2.2 Student Service & Controller ✅

**Files**: `src/services/studentService.js`, `src/controllers/studentController.js`, `src/routes/studentRoutes.js`

- ✅ CRUD operations
- ✅ Link Student to User (one-to-one relationship)
- ✅ Validate studentId uniqueness within tenant
- ✅ Validate dateOfBirth
- ✅ Validate emergency contact fields
- ✅ Auth middleware applied to routes

#### 2.3 Class Service & Controller ✅

**Files**: `src/services/classService.js`, `src/controllers/classController.js`, `src/routes/classRoutes.js`

- ✅ CRUD operations
- ✅ Validate teacher is a User in same tenant
- ✅ Validate class name uniqueness within tenant
- ✅ Get classes by teacher
- ✅ Get students enrolled in class
- ✅ Auth middleware applied to routes

#### 2.4 Subject Service & Controller ✅

**Files**: `src/services/subjectService.js`, `src/controllers/subjectController.js`, `src/routes/subjectRoutes.js`

- ✅ CRUD operations
- ✅ Validate subject code uniqueness within tenant
- ✅ Validate teacher assignment
- ✅ Get subjects by teacher
- ✅ Auth middleware applied to routes

#### 2.5 Enrollment Service & Controller ✅

**Files**: `src/services/enrollmentService.js`, `src/controllers/enrollmentController.js`, `src/routes/enrollmentRoutes.js`

- ✅ CRUD operations
- ✅ Validate student and class belong to same tenant
- ✅ Prevent duplicate enrollments (student + class combination)
- ✅ Get enrollments by student
- ✅ Get enrollments by class
- ✅ Bulk enrollment operations
- ✅ Auth middleware applied to routes

#### 2.6 Grade Service & Controller ✅

**Files**: `src/services/gradeService.js`, `src/controllers/gradeController.js`, `src/routes/gradeRoutes.js`

- ✅ CRUD operations
- ✅ Validate enrollment and subject belong to same tenant
- ✅ Get grades by student
- ✅ Get grades by subject
- ✅ Get grades by enrollment
- ✅ Calculate GPA/averages
- ✅ Auth middleware applied to routes

#### 2.7 Attendance Service & Controller ✅

**Files**: `src/services/attendanceService.js`, `src/controllers/attendanceController.js`, `src/routes/attendanceRoutes.js`

- ✅ CRUD operations
- ✅ Validate enrollment belongs to tenant
- ✅ Prevent duplicate attendance records (enrollment + date)
- ✅ Bulk attendance marking
- ✅ Get attendance by student
- ✅ Get attendance by class
- ✅ Calculate attendance statistics
- ✅ Auth middleware applied to routes

#### 2.8 Schedule Service & Controller ✅

**Files**: `src/services/scheduleService.js`, `src/controllers/scheduleController.js`, `src/routes/scheduleRoutes.js`

- ✅ CRUD operations
- ✅ Validate class and subject belong to tenant
- ✅ Prevent schedule conflicts (same class, same day, overlapping times)
- ✅ Get schedule by class
- ✅ Get schedule by day
- ✅ Get schedule by teacher (via subject)
- ✅ Auth middleware applied to routes

### Phase 3: Financial & Reporting Services

#### 3.1 Fee Service & Controller ✅

**Files**: `src/services/feeService.js`, `src/controllers/feeController.js`, `src/routes/feeRoutes.js`

- ✅ CRUD operations
- ✅ Validate student belongs to tenant
- ✅ Auto-update status based on dueDate (overdue detection)
- ✅ Calculate total fees by student
- ✅ Get fees by status
- ✅ Bulk fee creation
- ✅ Auth middleware applied to routes

#### 3.2 Payment Service & Controller 🔄 IN PROGRESS

**Files**: `src/services/paymentService.js`, `src/controllers/paymentController.js`, `src/routes/paymentRoutes.js`

- ✅ Service: CRUD operations
- ✅ Service: Validate fee belongs to tenant
- ✅ Service: Update fee status to 'paid' when payment is created
- ✅ Service: Validate payment amount doesn't exceed fee amount
- ✅ Service: Handle partial payments
- ✅ Service: Get payments by student
- ✅ Service: Get payments by date range
- ❌ Controller: Implementation needed
- ❌ Routes: Auth middleware needed

#### 3.3 Term Report Service & Controller ❌

**Files**: `src/services/termReportService.js`, `src/controllers/termReportController.js`, `src/routes/termReportRoutes.js`

- ❌ CRUD operations
- ❌ Validate student belongs to tenant
- ❌ Aggregate grades for term
- ❌ Generate report from existing grades
- ❌ Prevent duplicate reports (student + term + year)
- ❌ Get reports by student
- ❌ Get reports by term/year

#### 3.4 AI Report Request Service & Controller ❌

**Files**: `src/services/aiReportRequestService.js`, `src/controllers/aiReportRequestController.js`, `src/routes/aiReportRequestRoutes.js`

- ❌ CRUD operations
- ❌ Validate student and requester belong to tenant
- ❌ Queue report generation (placeholder for AI integration)
- ❌ Update status workflow (pending → processing → completed/failed)
- ❌ Store generated report content
- ❌ Get requests by student
- ❌ Get requests by status

### Phase 4: Supporting Services ❌

#### 4.1 Behavior Record Service & Controller ❌

**Files**: `src/services/behaviorRecordService.js`, `src/controllers/behaviorRecordController.js`, `src/routes/behaviorRecordRoutes.js`

- ❌ CRUD operations
- ❌ Validate student and reporter belong to tenant
- ❌ Get records by student
- ❌ Get records by date range

#### 4.2 Notification Service & Controller ❌

**Files**: `src/services/notificationService.js`, `src/controllers/notificationController.js`, `src/routes/notificationRoutes.js`

- ❌ CRUD operations
- ❌ Validate user belongs to tenant
- ❌ Mark as read/unread
- ❌ Get unread notifications
- ❌ Bulk notification creation

#### 4.3 Asset Service & Controller ❌

**Files**: `src/services/assetService.js`, `src/controllers/assetController.js`, `src/routes/assetRoutes.js`

- ❌ CRUD operations
- ❌ Validate uploader belongs to tenant
- ❌ File upload handling (integrate with storage service - S3, local, etc.)
- ❌ File type validation
- ❌ File size limits
- ❌ Generate signed URLs for file access

#### 4.4 Provider Service & Controller ❌

**Files**: `src/services/providerService.js`, `src/controllers/providerController.js`, `src/routes/providerRoutes.js`

- ❌ Note: Provider model doesn't have tenantId (global entity)
- ❌ CRUD operations (admin-only, no tenant isolation)

### Phase 5: Audit & Logging ❌

#### 5.1 Audit Log Service ❌

**File**: `src/services/auditLogService.js`

- ❌ Create audit log entries
- ❌ Log all CRUD operations
- ❌ Log authentication events
- ❌ Log permission denials
- ❌ Query audit logs (with tenant isolation)

#### 5.2 Audit Log Controller & Routes ❌

**Files**: `src/controllers/auditLogController.js`, `src/routes/auditLogRoutes.js`

- ❌ Get audit logs (admin-only)
- ❌ Filter by user, entity, date range
- ❌ Export audit logs

#### 5.3 Integrate Audit Logging ❌

- ❌ Add audit logging middleware or service calls in all controllers
- ❌ Log create, update, delete operations
- ❌ Store before/after states for updates
- ❌ Store IP addresses from requests

### Phase 6: Route Protection & Authorization

#### 6.1 Apply Auth Middleware ✅ MOSTLY COMPLETE

Update all route files to include `authMiddleware`:

- ✅ `src/routes/studentRoutes.js`
- ✅ `src/routes/classRoutes.js`
- ✅ `src/routes/subjectRoutes.js`
- ✅ `src/routes/enrollmentRoutes.js`
- ✅ `src/routes/gradeRoutes.js`
- ✅ `src/routes/attendanceRoutes.js`
- ✅ `src/routes/scheduleRoutes.js`
- ✅ `src/routes/feeRoutes.js`
- ❌ `src/routes/paymentRoutes.js` - NEEDS AUTH MIDDLEWARE
- ❌ `src/routes/termReportRoutes.js`
- ❌ `src/routes/aiReportRequestRoutes.js`
- ❌ `src/routes/behaviorRecordRoutes.js`
- ❌ `src/routes/notificationRoutes.js`
- ❌ `src/routes/assetRoutes.js`
- ✅ `src/routes/roleRoutes.js`
- ❌ `src/routes/auditLogRoutes.js`
- ❌ `src/routes/providerRoutes.js`

#### 6.2 Apply RBAC Middleware ❌

Add permission checks to routes:

- ❌ Admin-only: tenant management, user management, audit logs
- ❌ Teacher+: grade creation, attendance marking, schedule management
- ❌ Student/Teacher: view own grades, view own attendance
- ❌ Custom permissions per resource

### Phase 7: Validation & Error Handling

#### 7.1 Create Validation Schemas ❌

**New File**: `src/validators/*.js` (one per resource)

- ❌ Student validation: studentId format, dateOfBirth, emergency contact
- ❌ Grade validation: grade format, date ranges
- ❌ Fee validation: amount > 0, dueDate in future
- ❌ Payment validation: amount <= fee amount
- ❌ Enrollment validation: prevent duplicates
- ❌ Schedule validation: time format, no conflicts

#### 7.2 Apply Validation Middleware ❌

- ❌ Add validation middleware to all POST/PUT routes
- ❌ Return clear validation error messages
- ❌ Handle Mongoose validation errors

#### 7.3 Global Error Handler ✅

**Update**: `server.js`

- ✅ Error handling middleware added at the end
- ✅ Formats errors consistently
- ✅ Handles common error types

### Phase 8: Additional Features ❌

#### 8.1 Tenant Service Enhancements ❌

**File**: `src/services/tenantService.js`

- ❌ Add tenant slug validation
- ❌ Prevent duplicate slugs
- ❌ Add tenant settings update
- ❌ Add subscription plan management
- ❌ Add tenant status management (suspend/activate)

#### 8.2 User Service Enhancements ❌

**File**: `src/services/userService.js`

- ❌ Add password reset functionality
- ❌ Add email verification
- ❌ Add user profile update
- ❌ Add user role assignment/removal
- ❌ Add user activation/deactivation

#### 8.3 Query Enhancements ❌

- ❌ Add pagination to all list endpoints
- ❌ Add filtering (by status, date range, etc.)
- ❌ Add sorting
- ❌ Add search functionality
- ❌ Add field selection (projection)

### Phase 9: Testing & Documentation ❌

#### 9.1 Environment Configuration ❌

**New File**: `.env.example`

- ❌ Document all required environment variables
- ❌ MONGO_URI
- ❌ JWT_SECRET
- ❌ PORT
- ❌ NODE_ENV

#### 9.2 API Documentation ❌

**New File**: `API_DOCUMENTATION.md`

- ❌ Document all endpoints
- ❌ Request/response examples
- ❌ Authentication requirements
- ❌ Permission requirements
- ❌ Error codes

#### 9.3 README Updates ❌

**File**: `README.md`

- ❌ Project description
- ❌ Setup instructions
- ❌ Environment variables
- ❌ API overview
- ❌ Architecture overview

#### 9.4 Testing Considerations ❌

- ❌ Unit tests for services
- ❌ Integration tests for controllers
- ❌ Test tenant isolation
- ❌ Test authentication/authorization
- ❌ Test validation
- ❌ Test error handling

## Implementation Order

1. ✅ **Foundation First**: Fix auth, add middleware (RBAC, validation, error handling)
2. ✅ **Core Resources**: Students, Classes, Subjects, Enrollments
3. ✅ **Academic**: Grades, Attendance, Schedules
4. 🔄 **Financial**: Fees ✅, Payments (service done, controller needed)
5. ❌ **Reporting**: Term Reports, AI Reports
6. ❌ **Supporting**: Behavior Records, Notifications, Assets
7. ❌ **Audit & Security**: Audit logging, route protection
8. ❌ **Polish**: Validation, error handling, documentation

## Key Patterns to Follow

### Service Pattern

```javascript
exports.createResource = async (resourceData, tenantId) => {
  // 1. Validate tenantId
  // 2. Validate resourceData
  // 3. Add tenantId to resourceData
  // 4. Create resource
  // 5. Return created resource (without sensitive data)
};
```

### Controller Pattern

```javascript
exports.createResource = async (req, res) => {
  try {
    // 1. Check authentication (middleware handles this)
    // 2. Extract tenantId from req.user
    // 3. Validate input (middleware handles this)
    // 4. Call service with tenantId
    // 5. Log audit event
    // 6. Return response
  } catch (error) {
    // Error middleware handles this
  }
};
```

### Tenant Isolation

- **Always** filter by `tenantId` in queries
- **Never** trust `tenantId` from request body
- **Always** use `req.user.tenantId` from authenticated user
- **Validate** referenced entities belong to same tenant

### Soft Deletes

- Use `deleted: false` in all queries
- Set `deleted: true` and `deletedAt: Date.now()` on delete
- Never actually delete records (for audit trail)

## Files Status

**New Files Created:**

- ✅ `src/middleware/rbacMiddleware.js`
- ✅ `src/middleware/tenantMiddleware.js`
- ✅ `src/middleware/validationMiddleware.js`
- ✅ `src/middleware/errorHandler.js`

**Files Completed:**

- ✅ `src/services/authService.js` (fixed role assignment)
- ✅ `src/services/roleService.js`
- ✅ `src/controllers/roleController.js`
- ✅ `src/services/studentService.js`
- ✅ `src/controllers/studentController.js`
- ✅ `src/services/classService.js`
- ✅ `src/controllers/classController.js`
- ✅ `src/services/subjectService.js`
- ✅ `src/controllers/subjectController.js`
- ✅ `src/services/enrollmentService.js`
- ✅ `src/controllers/enrollmentController.js`
- ✅ `src/services/gradeService.js`
- ✅ `src/controllers/gradeController.js`
- ✅ `src/services/attendanceService.js`
- ✅ `src/controllers/attendanceController.js`
- ✅ `src/services/scheduleService.js`
- ✅ `src/controllers/scheduleController.js`
- ✅ `src/services/feeService.js`
- ✅ `src/controllers/feeController.js`
- ✅ `src/services/paymentService.js`
- ✅ `src/middleware/authMiddleware.js` (enhanced)
- ✅ `src/controllers/authController.js` (enhanced)
- ✅ `server.js` (error handler added)

**Routes Updated with Auth Middleware:**

- ✅ `src/routes/studentRoutes.js`
- ✅ `src/routes/classRoutes.js`
- ✅ `src/routes/subjectRoutes.js`
- ✅ `src/routes/enrollmentRoutes.js`
- ✅ `src/routes/gradeRoutes.js`
- ✅ `src/routes/attendanceRoutes.js`
- ✅ `src/routes/scheduleRoutes.js`
- ✅ `src/routes/feeRoutes.js`
- ✅ `src/routes/roleRoutes.js`

**Files Still Needed:**

- ❌ `src/controllers/paymentController.js` (implementation)
- ❌ `src/routes/paymentRoutes.js` (add auth middleware)
- ❌ All remaining service/controller files for Phase 3.3, 3.4, Phase 4, Phase 5
- ❌ `src/validators/*.js` (validation schemas)
- ❌ `.env.example`
- ❌ `API_DOCUMENTATION.md`

**Files to Enhance:**

- ❌ `README.md`
- ❌ `src/services/tenantService.js`
- ❌ `src/services/userService.js`

## Next Steps

1. **Immediate**: Complete Payment Controller and add auth middleware to payment routes
2. **Short-term**: Implement Term Report and AI Report Request services/controllers
3. **Medium-term**: Implement supporting services (Behavior Records, Notifications, Assets, Provider)
4. **Long-term**: Implement audit logging, add validation schemas, complete documentation

## Progress Summary

- **Phase 1**: ✅ 100% Complete
- **Phase 2**: ✅ 100% Complete
- **Phase 3**: 🔄 50% Complete (Fee ✅, Payment service ✅, Payment controller ❌, Term Report ❌, AI Report ❌)
- **Phase 4**: ❌ 0% Complete
- **Phase 5**: ❌ 0% Complete
- **Phase 6**: 🔄 50% Complete (Auth middleware mostly done, RBAC not applied)
- **Phase 7**: 🔄 33% Complete (Error handler done, validation schemas needed)
- **Phase 8**: ❌ 0% Complete
- **Phase 9**: ❌ 0% Complete

**Overall Progress: ~45% Complete**
