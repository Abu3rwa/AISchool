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

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Routes

// Core routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tenants', tenantRoutes);

// Scaffolded resource routes
app.use('/api/providers', providerRoutes);
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
