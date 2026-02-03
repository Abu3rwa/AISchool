Act as a Senior Backend Architect and MongoDB Data Modeler.

I am building a **Multi-Tenant School Management System (SaaS)** using:
- Node.js
- MongoDB
- Mongoose
- JavaScript (ES6+)
- MERN stack

Your task is to generate **ALL REQUIRED DATABASE MODELS ONLY**.

⚠️ IMPORTANT RULES
- JavaScript ONLY (NO TypeScript)
- Use Mongoose schemas
- Production-ready
- NO routes, NO controllers, NO services
- Focus ONLY on models and data design
- Think like a real SaaS architect

==============================
MULTI-TENANT RULES (CRITICAL)
==============================

- The system uses **ONE MongoDB database**
- Every tenant-scoped model MUST include:
  tenantId: ObjectId (indexed)
  - TenantId MUST be mandatory
  - Add compound indexes using tenantId where needed
  - No global data leakage is allowed
  - Use timestamps on all schemas
  - Support soft deletes where appropriate

  ==============================
  REQUIRED MODELS (GENERATE ALL)
  ==============================

  Generate the following Mongoose models:

  1. Tenant (School / Organization)
  2. User
  3. Role
  4. Student
  5. Class
  6. Subject
  7. Enrollment
  8. Grade
  9. Attendance
  10. BehaviorRecord
  11. Schedule (Timetable)
  12. Fee (Invoice)
  13. Payment
  14. AIReportRequest
  15. TermReport
  16. Notification
  17. Asset (Files & Media)
  18. AuditLog

  ==============================
  FOR EACH MODEL, YOU MUST:
  ==============================

  For EACH model:

  1. Provide the **Mongoose schema**
  2. Include:
     - All fields
        - Correct data types
           - Required fields
              - Enums where applicable
                 - Default values
                    - Relationships using ObjectId refs
                    3. Add:
                       - Indexes (especially tenantId-based)
                          - Unique constraints (tenant-safe)
                          4. Enable:
                             - timestamps
                                - soft delete support (deleted, deletedAt)
                                5. Follow clean naming conventions
                                6. Add a **short explanation** describing:
                                   - Purpose of the model
                                      - Why key fields exist
                                         - How it relates to other models

                                         ==============================
                                         SPECIAL REQUIREMENTS
                                         ==============================

                                         🔹 USER MODEL