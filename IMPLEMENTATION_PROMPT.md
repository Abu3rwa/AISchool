# Complete GradeBooking SaaS Implementation - AI Prompt

## Context

You are continuing the implementation of a **multi-tenant school management SaaS application** built with Node.js, Express.js, MongoDB, and Mongoose. The project follows an MVC pattern with Routes → Controllers → Services → Models.

## Current Status

### ✅ Completed (Phase 1 & 2, Partial Phase 3)

**Foundation & Security (Phase 1) - 100% Complete:**
- Authentication service fixed with proper role assignment using ObjectId references
- Default roles (ADMIN, TEACHER, STUDENT) created automatically for new tenants
- Enhanced auth middleware with tenant status checks and token expiration handling
- RBAC middleware created (`requirePermission` and `requireRole`)
- Tenant isolation middleware created
- Input validation middleware created (express-validator)
- Error handling middleware created and integrated

**Core Services (Phase 2) - 100% Complete:**
- Role Service & Controller - Full CRUD with tenant isolation
- Student Service & Controller - Full CRUD with validations
- Class Service & Controller - Full CRUD with teacher validation
- Subject Service & Controller - Full CRUD with code uniqueness
- Enrollment Service & Controller - Full CRUD with duplicate prevention, bulk operations
- Grade Service & Controller - Full CRUD with GPA calculations
- Attendance Service & Controller - Full CRUD with statistics, bulk operations
- Schedule Service & Controller - Full CRUD with conflict detection

**Financial Services (Phase 3) - Partial:**
- Fee Service & Controller - ✅ Complete
- Payment Service - ✅ Complete (service only)
- Payment Controller - ❌ **NEEDS IMPLEMENTATION**
- Payment Routes - ❌ **NEEDS AUTH MIDDLEWARE**

### ❌ Remaining Work

**Phase 3 (Financial & Reporting):**
- Payment Controller implementation
- Payment Routes auth middleware
- Term Report Service & Controller
- AI Report Request Service & Controller

**Phase 4 (Supporting Services):**
- Behavior Record Service & Controller
- Notification Service & Controller
- Asset Service & Controller
- Provider Service & Controller

**Phase 5 (Audit & Logging):**
- Audit Log Service
- Audit Log Controller & Routes
- Integrate audit logging into all controllers

**Phase 6 (Route Protection):**
- Apply RBAC middleware to routes
- Add permission checks

**Phase 7 (Validation):**
- Create validation schemas for all resources
- Apply validation middleware to POST/PUT routes

**Phase 8 (Additional Features):**
- Tenant service enhancements
- User service enhancements
- Query enhancements (pagination, filtering, sorting)

**Phase 9 (Documentation):**
- Create `.env.example`
- Create `API_DOCUMENTATION.md`
- Update `README.md`

## Implementation Patterns

### Service Pattern
```javascript
exports.createResource = async (resourceData, tenantId) => {
  // 1. Validate tenantId
  // 2. Validate resourceData and referenced entities belong to tenant
  // 3. Add tenantId to resourceData (never trust from request)
  // 4. Create resource
  // 5. Return created resource (without sensitive data)
};
```

### Controller Pattern
```javascript
exports.createResource = async (req, res) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const resourceData = Object.assign({}, req.body, { tenantId: req.user.tenantId });
    const newResource = await resourceService.createResource(resourceData);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
```

### Route Pattern
```javascript
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/', resourceController.createResource);
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.put('/:id', resourceController.updateResource);
router.delete('/:id', resourceController.deleteResource);

module.exports = router;
```

## Critical Requirements

### Tenant Isolation (MANDATORY)
- **ALWAYS** filter by `tenantId` in all queries
- **NEVER** trust `tenantId` from request body
- **ALWAYS** use `req.user.tenantId` from authenticated user
- **VALIDATE** all referenced entities belong to same tenant

### Soft Deletes (MANDATORY)
- Use `deleted: false` in all queries
- Set `deleted: true` and `deletedAt: new Date()` on delete
- Never actually delete records (for audit trail)

### Error Handling
- All services should throw descriptive errors
- Controllers catch errors and return appropriate status codes
- Global error handler formats responses consistently

## Next Immediate Tasks

1. **Complete Payment Controller** (`src/controllers/paymentController.js`)
   - Implement all CRUD operations following the controller pattern
   - Use `paymentService` methods that are already implemented
   - Follow the same pattern as `feeController.js`

2. **Add Auth Middleware to Payment Routes** (`src/routes/paymentRoutes.js`)
   - Add `authMiddleware` using `router.use(authMiddleware)`
   - Follow the same pattern as `feeRoutes.js`

3. **Continue with Term Report Service & Controller**
   - Implement service with grade aggregation logic
   - Implement controller following the pattern
   - Add auth middleware to routes

4. **Continue with AI Report Request Service & Controller**
   - Implement service with status workflow
   - Implement controller following the pattern
   - Add auth middleware to routes

## File Structure Reference

```
src/
├── controllers/        # Request handlers (use req.user.tenantId)
├── services/           # Business logic (accept tenantId parameter)
├── routes/            # Route definitions (use authMiddleware)
├── models/            # Mongoose models (already complete)
├── middleware/        # Auth, RBAC, validation, error handling (complete)
└── validators/        # Validation schemas (to be created)
```

## Key Models Reference

All tenant-scoped models have:
- `tenantId: ObjectId` (required, indexed)
- `deleted: Boolean` (default: false)
- `deletedAt: Date`
- `timestamps: true`

Models: Tenant, User, Role, Student, Class, Subject, Enrollment, Grade, Attendance, Schedule, Fee, Payment, TermReport, AIReportRequest, BehaviorRecord, Notification, Asset, AuditLog, Provider

## Authentication

- JWT tokens include `{ id: userId, tenantId: tenantId }`
- Auth middleware validates token and attaches `req.user`
- All protected routes must use `authMiddleware`
- `req.user.tenantId` is the source of truth for tenant context

## Implementation Instructions

1. **Start with Payment Controller** - This is the immediate next step
2. **Follow existing patterns** - Look at `feeController.js` as a reference
3. **Maintain tenant isolation** - Always use `req.user.tenantId`
4. **Use soft deletes** - Never actually delete records
5. **Handle errors properly** - Throw descriptive errors in services, catch in controllers
6. **Add auth middleware** - All routes except `/api/auth/*` need authentication
7. **Test tenant isolation** - Ensure users can only access their tenant's data

## Success Criteria

- All services validate tenant isolation
- All controllers use `req.user.tenantId`
- All routes (except auth) use `authMiddleware`
- All deletes are soft deletes
- All errors are handled gracefully
- Code follows the established patterns

Continue implementing the remaining services and controllers following these patterns and requirements.

