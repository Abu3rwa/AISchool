const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/db');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const tenantRoutes = require('./src/routes/tenantRoutes');
const providerRoutes = require('./src/routes/providerRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const subjectRoutes = require('./src/routes/subjectRoutes');
const classRoutes = require('./src/routes/classRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const gradeRoutes = require('./src/routes/gradeRoutes');
const feeRoutes = require('./src/routes/feeRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const auditLogRoutes = require('./src/routes/auditLogRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const behaviorRecordRoutes = require('./src/routes/behaviorRecordRoutes');
const termReportRoutes = require('./src/routes/termReportRoutes');
const assetRoutes = require('./src/routes/assetRoutes');
const aiReportRequestRoutes = require('./src/routes/aiReportRequestRoutes');
const providerAuthRoutes = require('./src/routes/providerAuthRoutes');
const providerTenantRoutes = require('./src/routes/providerTenantRoutes');
const providerTenantUsersRoutes = require('./src/routes/providerTenantUsersRoutes');
const providerTenantRolesRoutes = require('./src/routes/providerTenantRolesRoutes');
const providerTenantMetricsRoutes = require('./src/routes/providerTenantMetricsRoutes');

// Portal routes (school user facing)
const portalStudentRoutes = require('./src/routes/portalStudentRoutes');
const portalTeacherRoutes = require('./src/routes/portalTeacherRoutes');
const portalClassRoutes = require('./src/routes/portalClassRoutes');
const portalSubjectRoutes = require('./src/routes/portalSubjectRoutes');
const portalClassSubjectRoutes = require('./src/routes/portalClassSubjectRoutes');
const portalMyRoutes = require('./src/routes/portalMyRoutes');

// Grade system routes
const gradeTypeRoutes = require('./src/routes/gradeTypeRoutes');
const termRoutes = require('./src/routes/termRoutes');
const gradingScaleRoutes = require('./src/routes/gradingScaleRoutes');
const portalGradeRoutes = require('./src/routes/portalGradeRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS (for local dev)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ];

  if (origin && allowed.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Body parser
app.use(express.json());

// Routes

// Core routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tenants', tenantRoutes);

// Scaffolded resource routes
app.use('/api/providers', providerRoutes);
app.use('/api/provider-auth', providerAuthRoutes);
app.use('/api/provider/tenants', providerTenantRoutes);
app.use('/api/provider/tenants', providerTenantUsersRoutes);
app.use('/api/provider/tenants', providerTenantRolesRoutes);
app.use('/api/provider/tenants', providerTenantMetricsRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/behavior-records', behaviorRecordRoutes);
app.use('/api/term-reports', termReportRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/ai-report-requests', aiReportRequestRoutes);

// Portal routes (school portal)
app.use('/api/portal/students', portalStudentRoutes);
app.use('/api/portal/teachers', portalTeacherRoutes);
app.use('/api/portal/classes', portalClassRoutes);
app.use('/api/portal/subjects', portalSubjectRoutes);
app.use('/api/portal/class-subjects', portalClassSubjectRoutes);
app.use('/api/portal/my', portalMyRoutes);

// Grade system routes
app.use('/api/portal/grade-types', gradeTypeRoutes);
app.use('/api/portal/terms', termRoutes);
app.use('/api/portal/grading-scale', gradingScaleRoutes);
app.use('/api/portal/grades', portalGradeRoutes);

// Error handler middleware (must be last)
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
