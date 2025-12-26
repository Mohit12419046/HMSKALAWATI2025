const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const socketIo = require('socket.io');
const http = require('http');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Database connection and models
const { sequelize, User, Patient, Admission, Medication, Vital, Symptom, Appointment, Billing, Inventory, Notification, ActivityLog, OpdVisit, GovernmentPatient, Payment, syncDatabase } = require('./models');

// Sync database
syncDatabase();

// Initialize AI components
const GeminiAI = require('./geminiAI');
const PredictiveAnalytics = require('./predictiveAnalytics');

const geminiAI = new GeminiAI();
const predictiveAnalytics = new PredictiveAnalytics({}, 'http://127.0.0.1:5000/api');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Routes

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      timeout: 10000
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Log login activity
    console.log(`User ${user.name} (${user.email}) logged in from IP: ${req.ip}`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/register', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existingUser = await User.findOne({
      where: { email },
      timeout: 10000
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      isActive: true
    });

    console.log(`User ${name} created with role ${role} by ${req.user.name}`);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User management routes
app.get('/api/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/:id/status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    await User.update({ isActive }, { where: { id: req.params.id } });

    console.log(`User status changed to ${isActive} by ${req.user.name}`);

    res.json({ message: 'User status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Patient routes
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const patient = await Patient.create(req.body);

    console.log(`Patient ${req.body.name} created by ${req.user.name}`);

    // Send notifications to all users about new patient registration
    await sendPatientNotificationToAllUsers(patient.id, 'patient_created', 'medium');
    await sendPatientDataEmailToAllUsers(patient.id, false); // Basic patient info only

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admission routes
app.get('/api/admissions', authenticateToken, async (req, res) => {
  try {
    const admissions = await Admission.findAll({
      include: [{ model: Patient, attributes: ['name'] }]
    });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admissions', async (req, res) => {
  try {
    const admission = await Admission.create(req.body);

    // Update bed occupancy
    await updateBedOccupancy(admission.room, true);

    console.log(`Patient admitted to room ${admission.room} by ${req.user.name}`);

    // Emit real-time update
    io.emit('admission_update', { type: 'admit', admission });

    res.status(201).json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admissions/:id/discharge', authenticateToken, authorizeRoles('admin', 'doctor'), async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.id);
    await admission.update({
      status: 'discharged',
      dischargeDate: new Date()
    });

    // Update bed occupancy
    await updateBedOccupancy(admission.room, false);

    console.log(`Patient discharged from room ${admission.room} by ${req.user.name}`);

    // Emit real-time update
    io.emit('admission_update', { type: 'discharge', admission });

    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Medication routes
app.get('/api/medications', authenticateToken, async (req, res) => {
  try {
    const medications = await Medication.findAll({
      include: [{ model: Patient, attributes: ['name'] }]
    });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/medications', authenticateToken, authorizeRoles('admin', 'doctor', 'nurse'), async (req, res) => {
  try {
    const medication = await Medication.create(req.body);

    console.log(`Medication ${req.body.name} created by ${req.user.name}`);

    res.status(201).json(medication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vital signs routes
app.get('/api/vitals/:userId', authenticateToken, async (req, res) => {
  try {
    const vitals = await Vital.findAll({ where: { userId: req.params.userId } });
    res.json(vitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const vital = await Vital.create(req.body);

    // Check for abnormal values and create alerts
    if (isAbnormalVital(vital)) {
      await createAlert('vital_abnormal', `Abnormal ${vital.type}: ${vital.value} ${vital.unit}`, 'high');
    }

    res.status(201).json(vital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Symptom routes
app.get('/api/symptoms/:userId', authenticateToken, async (req, res) => {
  try {
    const symptoms = await Symptom.findAll({ where: { userId: req.params.userId } });
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/symptoms', authenticateToken, async (req, res) => {
  try {
    const symptom = await Symptom.create(req.body);

    // Create alert for high-severity symptoms
    if (symptom.severity >= 8) {
      await createAlert('symptom_high', `High severity symptom: ${symptom.name}`, 'high');
    }

    res.status(201).json(symptom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Appointment routes
app.get('/api/appointments/:userId', authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({ where: { userId: req.params.userId } });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);

    console.log(`Appointment created for ${appointment.datetime} by ${req.user.name}`);

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Inventory routes
app.get('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const inventory = await Inventory.findAll();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/inventory', authenticateToken, authorizeRoles('admin', 'nurse'), async (req, res) => {
  try {
    const item = await Inventory.create(req.body);

    // Check for low stock
    if (item.quantity <= item.minStockLevel) {
      await createAlert('low_stock', `Low stock: ${item.name} (${item.quantity} remaining)`, 'medium');
    }

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Billing routes
app.get('/api/billing', authenticateToken, authorizeRoles('admin', 'receptionist'), async (req, res) => {
  try {
    const bills = await Billing.findAll({
      include: [{ model: Patient, attributes: ['name'] }]
    });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/billing', authenticateToken, authorizeRoles('admin', 'receptionist'), async (req, res) => {
  try {
    const bill = await Billing.create(req.body);

    console.log(`Bill created for ${req.body.amount} by ${req.user.name}`);

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Government Patient routes
app.get('/api/government-patients', authenticateToken, async (req, res) => {
  try {
    const governmentPatients = await GovernmentPatient.findAll({
      include: [
        { model: Patient, attributes: ['name', 'email', 'phone'] },
        { model: User, as: 'registeredBy', attributes: ['name'] }
      ]
    });
    res.json(governmentPatients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/government-patients', authenticateToken, async (req, res) => {
  try {
    const governmentPatient = await GovernmentPatient.create(req.body);

    console.log(`Government patient card created for patient ${req.body.patientId} by ${req.user.name}`);

    res.status(201).json(governmentPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/government-patients/:id', authenticateToken, async (req, res) => {
  try {
    const governmentPatient = await GovernmentPatient.findByPk(req.params.id, {
      include: [
        { model: Patient, attributes: ['name', 'email', 'phone', 'dateOfBirth', 'gender'] },
        { model: User, as: 'registeredBy', attributes: ['name'] }
      ]
    });

    if (!governmentPatient) {
      return res.status(404).json({ message: 'Government patient record not found' });
    }

    res.json(governmentPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Payment routes
app.get('/api/payments', authenticateToken, authorizeRoles('admin', 'receptionist'), async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: Billing, attributes: ['amount', 'description', 'status'] },
        { model: Patient, attributes: ['name'] },
        { model: User, as: 'processedBy', attributes: ['name'] }
      ]
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/payments', authenticateToken, authorizeRoles('admin', 'receptionist'), async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    console.log(`Payment of ${req.body.amount} processed by ${req.user.name}`);

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/payments/:id', authenticateToken, authorizeRoles('admin', 'receptionist'), async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        { model: Billing, attributes: ['amount', 'description', 'status'] },
        { model: Patient, attributes: ['name', 'email', 'phone'] },
        { model: User, as: 'processedBy', attributes: ['name'] }
      ]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// OPD Visit routes
app.get('/api/opd-visits', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.query;
    let whereClause = {};

    if (patientId) {
      whereClause.patientId = patientId;
    }

    const opdVisits = await OpdVisit.findAll({
      where: whereClause,
      include: [
        { model: Patient, attributes: ['name', 'email', 'phone'] },
        { model: User, as: 'doctor', attributes: ['name', 'department'] },
        { model: User, as: 'createdBy', attributes: ['name'] }
      ],
      order: [['visitDate', 'DESC']]
    });
    res.json(opdVisits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/opd-visits/:id', authenticateToken, async (req, res) => {
  try {
    const opdVisit = await OpdVisit.findByPk(req.params.id, {
      include: [
        { model: Patient, attributes: ['name', 'email', 'phone', 'dateOfBirth', 'gender'] },
        { model: User, as: 'doctor', attributes: ['name', 'department'] },
        { model: User, as: 'createdBy', attributes: ['name'] }
      ]
    });

    if (!opdVisit) {
      return res.status(404).json({ message: 'OPD visit not found' });
    }

    res.json(opdVisit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/opd-visits', authenticateToken, async (req, res) => {
  try {
    const opdVisitData = {
      ...req.body,
      createdById: req.user.id
    };

    const opdVisit = await OpdVisit.create(opdVisitData);

    // Log activity
    console.log(`OPD visit created for patient ${req.body.patientId} by ${req.user.name}`);

    // Emit real-time update
    io.emit('opd_visit_update', { type: 'create', opdVisit });

    res.status(201).json(opdVisit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/opd-visits/:id', authenticateToken, async (req, res) => {
  try {
    const opdVisit = await OpdVisit.findByPk(req.params.id);
    if (!opdVisit) {
      return res.status(404).json({ message: 'OPD visit not found' });
    }

    await opdVisit.update(req.body);

    console.log(`OPD visit ${req.params.id} updated by ${req.user.name}`);

    // Emit real-time update
    io.emit('opd_visit_update', { type: 'update', opdVisit });

    res.json(opdVisit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/opd-visits/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const opdVisit = await OpdVisit.findByPk(req.params.id);

    if (!opdVisit) {
      return res.status(404).json({ message: 'OPD visit not found' });
    }

    await opdVisit.update({ status });

    console.log(`OPD visit ${req.params.id} status changed to ${status} by ${req.user.name}`);

    // Emit real-time update
    io.emit('opd_visit_update', { type: 'status_update', opdVisit });

    res.json(opdVisit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Notification routes
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { recipient: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/notifications/broadcast', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { message, priority } = req.body;
    const notification = await Notification.create({
      message,
      priority: priority || 'low',
      type: 'broadcast',
      sender: req.user.id
    });

    // Emit real-time notification
    io.emit('notification', notification);

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reports route
app.get('/api/reports/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    const [vitals, symptoms, medications, appointments] = await Promise.all([
      Vital.findAll({ where: { userId } }),
      Symptom.findAll({ where: { userId } }),
      Medication.findAll({ where: { patient: userId } }),
      Appointment.findAll({ where: { userId } })
    ]);

    const reportData = {
      vitals,
      symptoms,
      medications,
      appointments,
      generatedAt: new Date()
    };

    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Personalized Health Report route
app.get('/api/reports/personalized/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Allow access if user is admin/doctor or requesting their own report
    if (req.user.role !== 'admin' && req.user.role !== 'doctor' && req.user.id != userId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own reports.' });
    }

    const report = await predictiveAnalytics.generatePersonalizedHealthReport(userId);

    if (report.error) {
      return res.status(500).json({ message: report.error });
    }

    console.log(`Personalized health report generated for user ${userId} by ${req.user.name}`);

    res.json(report);
  } catch (error) {
    console.error('Error generating personalized health report:', error);
    res.status(500).json({ message: 'Error generating personalized health report: ' + error.message });
  }
});

// Generate Patient Summary Report
app.get('/api/reports/patient-summary', authenticateToken, async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [
        { model: Admission, as: 'admissions' },
        { model: Medication, as: 'medications' },
        { model: Vital, as: 'vitals' },
        { model: Symptom, as: 'symptoms' },
        { model: Appointment, as: 'appointments' }
      ]
    });

    const doc = new PDFDocument();
    const filename = `patient_summary_report_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text('KALAWATI HOSPITAL - Patient Summary Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    patients.forEach((patient, index) => {
      doc.fontSize(14).text(`${index + 1}. ${patient.name}`, { underline: true });
      doc.fontSize(10);
      doc.text(`ID: ${patient.id} | Age: ${patient.age} | Email: ${patient.email || 'N/A'}`);
      doc.text(`Admissions: ${patient.admissions?.length || 0} | Medications: ${patient.medications?.length || 0}`);
      doc.text(`Vitals Recorded: ${patient.vitals?.length || 0} | Symptoms: ${patient.symptoms?.length || 0}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Admission Report
app.get('/api/reports/admission-report', authenticateToken, async (req, res) => {
  try {
    const admissions = await Admission.findAll({
      include: [{ model: Patient, attributes: ['name', 'email'] }],
      order: [['admissionDate', 'DESC']]
    });

    const doc = new PDFDocument();
    const filename = `admission_report_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text('KALAWATI HOSPITAL - Admission Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const admittedCount = admissions.filter(a => a.status === 'admitted').length;
    const dischargedCount = admissions.filter(a => a.status === 'discharged').length;

    doc.fontSize(14).text('Summary:', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Admissions: ${admissions.length}`);
    doc.text(`Currently Admitted: ${admittedCount}`);
    doc.text(`Total Discharged: ${dischargedCount}`);
    doc.moveDown(2);

    admissions.forEach((admission, index) => {
      doc.fontSize(12).text(`${index + 1}. Patient: ${admission.Patient?.name || 'Unknown'}`, { underline: true });
      doc.fontSize(10);
      doc.text(`Room: ${admission.room} | Status: ${admission.status}`);
      doc.text(`Diagnosis: ${admission.diagnosis || 'N/A'}`);
      doc.text(`Admission Date: ${new Date(admission.admissionDate).toLocaleDateString()}`);
      if (admission.dischargeDate) {
        doc.text(`Discharge Date: ${new Date(admission.dischargeDate).toLocaleDateString()}`);
      }
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Medication Compliance Report
app.get('/api/reports/medication-compliance', authenticateToken, async (req, res) => {
  try {
    const medications = await Medication.findAll({
      include: [{ model: Patient, attributes: ['name'] }],
      order: [['startDate', 'DESC']]
    });

    const doc = new PDFDocument();
    const filename = `medication_compliance_report_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text('KALAWATI HOSPITAL - Medication Compliance Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const activeMeds = medications.filter(m => m.active).length;
    const inactiveMeds = medications.filter(m => !m.active).length;

    doc.fontSize(14).text('Summary:', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Medications: ${medications.length}`);
    doc.text(`Active Medications: ${activeMeds}`);
    doc.text(`Inactive Medications: ${inactiveMeds}`);
    doc.moveDown(2);

    medications.forEach((med, index) => {
      doc.fontSize(12).text(`${index + 1}. ${med.name}`, { underline: true });
      doc.fontSize(10);
      doc.text(`Patient: ${med.Patient?.name || 'Unknown'} | Dose: ${med.dose || 'N/A'}`);
      doc.text(`Schedule: ${med.schedule || 'N/A'} | Status: ${med.active ? 'Active' : 'Inactive'}`);
      doc.text(`Start Date: ${med.startDate ? new Date(med.startDate).toLocaleDateString() : 'N/A'}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Vital Signs Report
app.get('/api/reports/vital-signs', authenticateToken, async (req, res) => {
  try {
    const vitals = await Vital.findAll({
      include: [{ model: Patient, attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
      limit: 1000
    });

    const doc = new PDFDocument();
    const filename = `vital_signs_report_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text('KALAWATI HOSPITAL - Vital Signs Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Group vitals by type
    const vitalsByType = vitals.reduce((acc, vital) => {
      if (!acc[vital.type]) acc[vital.type] = [];
      acc[vital.type].push(vital);
      return acc;
    }, {});

    doc.fontSize(14).text('Summary by Type:', { underline: true });
    doc.fontSize(12);
    Object.keys(vitalsByType).forEach(type => {
      doc.text(`${type}: ${vitalsByType[type].length} records`);
    });
    doc.moveDown(2);

    Object.keys(vitalsByType).forEach(type => {
      doc.fontSize(14).text(`${type} Records:`, { underline: true });
      doc.moveDown();

      vitalsByType[type].slice(0, 50).forEach((vital, index) => {
        doc.fontSize(10);
        doc.text(`${index + 1}. Patient: ${vital.Patient?.name || 'Unknown'} | Value: ${vital.value} ${vital.unit || ''}`);
        doc.text(`   Recorded: ${new Date(vital.createdAt).toLocaleString()}`);
        doc.moveDown(0.5);
      });
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Financial Report
app.get('/api/reports/financial', authenticateToken, authorizeRoles('admin', 'receptionist'), async (req, res) => {
  try {
    const bills = await Billing.findAll({
      include: [{ model: Patient, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });

    const doc = new PDFDocument();
    const filename = `financial_report_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text('KALAWATI HOSPITAL - Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const totalRevenue = bills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    const pendingBills = bills.filter(b => b.status === 'pending').length;
    const paidBills = bills.filter(b => b.status === 'paid').length;

    doc.fontSize(14).text('Financial Summary:', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Bills: ${bills.length}`);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`);
    doc.text(`Paid Bills: ${paidBills}`);
    doc.text(`Pending Bills: ${pendingBills}`);
    doc.moveDown(2);

    bills.forEach((bill, index) => {
      doc.fontSize(12).text(`${index + 1}. Patient: ${bill.Patient?.name || 'Unknown'}`, { underline: true });
      doc.fontSize(10);
      doc.text(`Amount: $${bill.amount} | Status: ${bill.status}`);
      doc.text(`Description: ${bill.description || 'N/A'}`);
      doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Staff Performance Report
app.get('/api/reports/staff-performance', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: ActivityLog, as: 'activities' }]
    });

    const doc = new PDFDocument();
    const filename = `staff_performance_report_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text('KALAWATI HOSPITAL - Staff Performance Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const doctors = users.filter(u => u.role === 'doctor').length;
    const nurses = users.filter(u => u.role === 'nurse').length;
    const admins = users.filter(u => u.role === 'admin').length;

    doc.fontSize(14).text('Staff Summary:', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Staff: ${totalUsers}`);
    doc.text(`Active Staff: ${activeUsers}`);
    doc.text(`Doctors: ${doctors}`);
    doc.text(`Nurses: ${nurses}`);
    doc.text(`Administrators: ${admins}`);
    doc.moveDown(2);

    users.forEach((user, index) => {
      doc.fontSize(12).text(`${index + 1}. ${user.name}`, { underline: true });
      doc.fontSize(10);
      doc.text(`Role: ${user.role} | Department: ${user.department || 'N/A'}`);
      doc.text(`Status: ${user.isActive ? 'Active' : 'Inactive'}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}`);
      doc.text(`Activities: ${user.activities?.length || 0}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analytics routes
app.get('/api/analytics/overview', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalPatients,
      admittedPatients,
      totalRevenue,
      lowStockItems,
      pendingBills
    ] = await Promise.all([
      Patient.count(),
      Admission.count({ where: { status: 'admitted' } }),
      sequelize.query(`
        SELECT SUM(amount) as total FROM Billings WHERE createdAt >= ?
      `, {
        replacements: [startOfMonth],
        type: sequelize.QueryTypes.SELECT
      }),
      Inventory.count({
        where: sequelize.literal('quantity <= minStockLevel')
      }),
      Billing.count({ where: { status: 'pending' } })
    ]);

    res.json({
      totalPatients,
      admittedPatients,
      totalRevenue: totalRevenue[0]?.total || 0,
      lowStockItems,
      pendingBills
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Activity logs
app.get('/api/activity-logs', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      include: [{ model: User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AI Diagnosis routes
app.post('/api/ai/diagnose', authenticateToken, authorizeRoles('admin', 'doctor'), async (req, res) => {
  try {
    const { symptoms, patientId, additionalInfo } = req.body;

    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ message: 'Symptoms array is required' });
    }

    const diagnosis = await geminiAI.diagnose(symptoms, additionalInfo);

    // Log AI diagnosis activity
    console.log(`AI diagnosis performed for patient ${patientId} by ${req.user.name}`);

    res.json({
      diagnosis,
      timestamp: new Date(),
      performedBy: req.user.name
    });
  } catch (error) {
    console.error('AI diagnosis error:', error);
    res.status(500).json({ message: 'Error performing AI diagnosis' });
  }
});

// AI Chat routes
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await geminiAI.chat(message, context);

    res.json({
      response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Error processing chat message' });
  }
});

// Predictive Analytics routes
app.get('/api/analytics/predict/:patientId', authenticateToken, authorizeRoles('admin', 'doctor'), async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Get patient data for prediction
    const [vitals, symptoms, admissions] = await Promise.all([
      Vital.findAll({ where: { userId: patientId }, order: [['createdAt', 'DESC']], limit: 50 }),
      Symptom.findAll({ where: { userId: patientId }, order: [['createdAt', 'DESC']], limit: 50 }),
      Admission.findAll({ where: { patientId }, order: [['createdAt', 'DESC']], limit: 10 })
    ]);

    const prediction = await predictiveAnalytics.predictRisk({
      vitals,
      symptoms,
      admissions
    });

    res.json({
      patientId,
      prediction,
      timestamp: new Date(),
      analyzedBy: req.user.name
    });
  } catch (error) {
    console.error('Predictive analytics error:', error);
    res.status(500).json({ message: 'Error generating prediction' });
  }
});

// AI Treatment Recommendations
app.post('/api/ai/treatment', authenticateToken, authorizeRoles('admin', 'doctor'), async (req, res) => {
  try {
    const { diagnosis, patientHistory, currentMedications } = req.body;

    if (!diagnosis) {
      return res.status(400).json({ message: 'Diagnosis is required' });
    }

    const recommendations = await geminiAI.recommendTreatment(diagnosis, patientHistory, currentMedications);

    res.json({
      recommendations,
      timestamp: new Date(),
      generatedBy: req.user.name
    });
  } catch (error) {
    console.error('AI treatment recommendation error:', error);
    res.status(500).json({ message: 'Error generating treatment recommendations' });
  }
});

// Patient PDF generation
app.get('/api/patients/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.id;

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get all related data
    const [admissions, medications, vitals, symptoms, appointments, bills] = await Promise.all([
      Admission.findAll({ where: { patientId: patientId } }),
      Medication.findAll({ where: { patientId: patientId } }),
      Vital.findAll({ where: { userId: patientId } }),
      Symptom.findAll({ where: { userId: patientId } }),
      Appointment.findAll({ where: { userId: patientId } }),
      Billing.findAll({ where: { patientId: patientId } })
    ]);

    // Create PDF document
    const doc = new PDFDocument();
    const filename = `patient_${patient.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('KALAWATI HOSPITAL MANAGEMENT SYSTEM', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Patient Comprehensive Report', { align: 'center' });
    doc.moveDown(2);

    // Patient Information
    doc.fontSize(14).text('Patient Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Name: ${patient.name}`);
    doc.text(`Email: ${patient.email || 'N/A'}`);
    doc.text(`Phone: ${patient.phone || 'N/A'}`);
    doc.text(`Date of Birth: ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}`);
    doc.text(`Gender: ${patient.gender || 'N/A'}`);
    doc.text(`Address: ${patient.address || 'N/A'}`);
    doc.text(`Emergency Contact: ${patient.emergencyContact ? JSON.stringify(patient.emergencyContact) : 'N/A'}`);
    doc.moveDown();

    // Admissions
    if (admissions.length > 0) {
      doc.fontSize(14).text('Admission History', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      admissions.forEach((admission, index) => {
        doc.text(`${index + 1}. Room: ${admission.room}, Status: ${admission.status}`);
        doc.text(`   Diagnosis: ${admission.diagnosis || 'N/A'}`);
        doc.text(`   Admission Date: ${new Date(admission.admissionDate).toLocaleDateString()}`);
        if (admission.dischargeDate) {
          doc.text(`   Discharge Date: ${new Date(admission.dischargeDate).toLocaleDateString()}`);
        }
        doc.moveDown(0.5);
      });
    }

    // Medications
    if (medications.length > 0) {
      doc.fontSize(14).text('Medications', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      medications.forEach((med, index) => {
        doc.text(`${index + 1}. ${med.name} - ${med.dosage}`);
        doc.text(`   Frequency: ${med.frequency || 'N/A'}`);
        doc.text(`   Route: ${med.route || 'N/A'}`);
        doc.moveDown(0.5);
      });
    }

    // Vital Signs
    if (vitals.length > 0) {
      doc.fontSize(14).text('Vital Signs', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      vitals.forEach((vital, index) => {
        doc.text(`${index + 1}. ${vital.type}: ${vital.value} ${vital.unit}`);
        doc.text(`   Recorded: ${new Date(vital.createdAt).toLocaleString()}`);
        doc.moveDown(0.5);
      });
    }

    // Symptoms
    if (symptoms.length > 0) {
      doc.fontSize(14).text('Symptoms', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      symptoms.forEach((symptom, index) => {
        doc.text(`${index + 1}. ${symptom.name} - Severity: ${symptom.severity}/10`);
        doc.text(`   Description: ${symptom.description || 'N/A'}`);
        doc.text(`   Recorded: ${new Date(symptom.createdAt).toLocaleString()}`);
        doc.moveDown(0.5);
      });
    }

    // Appointments
    if (appointments.length > 0) {
      doc.fontSize(14).text('Appointments', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      appointments.forEach((appt, index) => {
        doc.text(`${index + 1}. ${appt.type || 'Appointment'}`);
        doc.text(`   Date: ${new Date(appt.datetime).toLocaleString()}`);
        doc.text(`   Notes: ${appt.notes || 'N/A'}`);
        doc.moveDown(0.5);
      });
    }

    // Billing
    if (bills.length > 0) {
      doc.fontSize(14).text('Billing History', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      bills.forEach((bill, index) => {
        doc.text(`${index + 1}. Amount: $${bill.amount}`);
        doc.text(`   Description: ${bill.description || 'N/A'}`);
        doc.text(`   Status: ${bill.status}`);
        doc.text(`   Date: ${new Date(bill.createdAt).toLocaleDateString()}`);
        doc.moveDown(0.5);
      });
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text(`Report Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text('KALAWATI Hospital Management System', { align: 'center' });

    // Finalize PDF
    doc.end();

    console.log(`PDF generated for patient ${patient.name} by ${req.user.name}`);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

// Email patient data
app.post('/api/send-comprehensive-patient-data/:patientId', authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const { include_all_data, recipientEmail, token } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    if (!token || token !== process.env.EMAIL_SEND_TOKEN) {
      return res.status(403).json({ message: 'Invalid email send token' });
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    let admissions = [], medications = [], vitals = [], symptoms = [], appointments = [];

    if (include_all_data) {
      [admissions, medications, vitals, symptoms, appointments] = await Promise.all([
        Admission.findAll({ where: { patientId: patientId } }),
        Medication.findAll({ where: { patientId: patientId } }),
        Vital.findAll({ where: { userId: patientId } }),
        Symptom.findAll({ where: { userId: patientId } }),
        Appointment.findAll({ where: { userId: patientId } })
      ]);
    }

    // Generate HTML email content
    const htmlContent = `
      <h1>KALAWATI HOSPITAL MANAGEMENT SYSTEM - Patient Comprehensive Report</h1>
      <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Generated by:</strong> ${req.user.name} (${req.user.email})</p>
      <p><strong>Patient:</strong> ${patient.name}</p>

      <h2>Patient Information</h2>
      <ul>
        <li><strong>Name:</strong> ${patient.name}</li>
        <li><strong>Email:</strong> ${patient.email || 'N/A'}</li>
        <li><strong>Phone:</strong> ${patient.phone || 'N/A'}</li>
        <li><strong>Date of Birth:</strong> ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</li>
        <li><strong>Gender:</strong> ${patient.gender || 'N/A'}</li>
        <li><strong>Address:</strong> ${patient.address || 'N/A'}</li>
        <li><strong>Emergency Contact:</strong> ${patient.emergencyContact ? JSON.stringify(patient.emergencyContact) : 'N/A'}</li>
      </ul>

      ${admissions.length > 0 ? `
      <h2>Admissions (${admissions.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Room</th><th>Status</th><th>Diagnosis</th><th>Admission Date</th><th>Discharge Date</th></tr>
        ${admissions.map(a => `<tr><td>${a.id}</td><td>${a.room}</td><td>${a.status}</td><td>${a.diagnosis || 'N/A'}</td><td>${new Date(a.admissionDate).toLocaleDateString()}</td><td>${a.dischargeDate ? new Date(a.dischargeDate).toLocaleDateString() : 'N/A'}</td></tr>`).join('')}
      </table>
      ` : ''}

      ${medications.length > 0 ? `
      <h2>Medications (${medications.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Name</th><th>Dosage</th><th>Frequency</th><th>Route</th></tr>
        ${medications.map(m => `<tr><td>${m.id}</td><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency || 'N/A'}</td><td>${m.route || 'N/A'}</td></tr>`).join('')}
      </table>
      ` : ''}

      ${vitals.length > 0 ? `
      <h2>Vital Signs (${vitals.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Type</th><th>Value</th><th>Unit</th><th>Recorded At</th></tr>
        ${vitals.map(v => `<tr><td>${v.id}</td><td>${v.type}</td><td>${v.value}</td><td>${v.unit}</td><td>${new Date(v.createdAt).toLocaleString()}</td></tr>`).join('')}
      </table>
      ` : ''}

      ${symptoms.length > 0 ? `
      <h2>Symptoms (${symptoms.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Name</th><th>Severity</th><th>Description</th><th>Recorded At</th></tr>
        ${symptoms.map(s => `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.severity}/10</td><td>${s.description || 'N/A'}</td><td>${new Date(s.createdAt).toLocaleString()}</td></tr>`).join('')}
      </table>
      ` : ''}

      ${appointments.length > 0 ? `
      <h2>Appointments (${appointments.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Type</th><th>Date & Time</th><th>Notes</th></tr>
        ${appointments.map(a => `<tr><td>${a.id}</td><td>${a.type || 'N/A'}</td><td>${new Date(a.datetime).toLocaleString()}</td><td>${a.notes || 'N/A'}</td></tr>`).join('')}
      </table>
      ` : ''}

      <br>
      <p><em>This report was generated from the KALAWATI Hospital Management System database.</em></p>
    `;

    // Email options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: `KALAWATI HMS - Patient Report for ${patient.name}`,
      html: htmlContent
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`Comprehensive data sent for patient ${patient.name} to ${recipientEmail} by ${req.user.name}`);

    res.json({ message: 'Patient data sent successfully via email' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Error sending email: ' + error.message });
  }
});

// Send all data via email (Admin only)
app.post('/api/send-all-data-email', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { recipientEmail, token } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    if (!token || token !== process.env.EMAIL_SEND_TOKEN) {
      return res.status(403).json({ message: 'Invalid email send token' });
    }

    // Get all data from the system
    const [patients, admissions, medications, vitals, symptoms, appointments, bills, inventory, users] = await Promise.all([
      Patient.findAll(),
      Admission.findAll({ include: [{ model: Patient, attributes: ['name'] }] }),
      Medication.findAll({ include: [{ model: Patient, attributes: ['name'] }] }),
      Vital.findAll(),
      Symptom.findAll(),
      Appointment.findAll(),
      Billing.findAll({ include: [{ model: Patient, attributes: ['name'] }] }),
      Inventory.findAll(),
      User.findAll({ attributes: { exclude: ['password'] } })
    ]);

    // Generate HTML email content
    const htmlContent = `
      <h1>KALAWATI HOSPITAL MANAGEMENT SYSTEM - Complete Data Report</h1>
      <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Generated by:</strong> ${req.user.name} (${req.user.email})</p>

      <h2>Summary</h2>
      <ul>
        <li>Total Patients: ${patients.length}</li>
        <li>Total Admissions: ${admissions.length}</li>
        <li>Total Medications: ${medications.length}</li>
        <li>Total Vital Signs: ${vitals.length}</li>
        <li>Total Symptoms: ${symptoms.length}</li>
        <li>Total Appointments: ${appointments.length}</li>
        <li>Total Bills: ${bills.length}</li>
        <li>Total Inventory Items: ${inventory.length}</li>
        <li>Total Users: ${users.length}</li>
      </ul>

      <h2>Patients (${patients.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Gender</th><th>Date of Birth</th></tr>
        ${patients.map(p => `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.email || 'N/A'}</td><td>${p.phone || 'N/A'}</td><td>${p.gender || 'N/A'}</td><td>${p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'N/A'}</td></tr>`).join('')}
      </table>

      <h2>Admissions (${admissions.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Patient</th><th>Room</th><th>Status</th><th>Diagnosis</th><th>Admission Date</th><th>Discharge Date</th></tr>
        ${admissions.map(a => `<tr><td>${a.id}</td><td>${a.Patient?.name || 'N/A'}</td><td>${a.room}</td><td>${a.status}</td><td>${a.diagnosis || 'N/A'}</td><td>${new Date(a.admissionDate).toLocaleDateString()}</td><td>${a.dischargeDate ? new Date(a.dischargeDate).toLocaleDateString() : 'N/A'}</td></tr>`).join('')}
      </table>

      <h2>Medications (${medications.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Patient</th><th>Name</th><th>Dosage</th><th>Frequency</th><th>Route</th></tr>
        ${medications.map(m => `<tr><td>${m.id}</td><td>${m.Patient?.name || 'N/A'}</td><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency || 'N/A'}</td><td>${m.route || 'N/A'}</td></tr>`).join('')}
      </table>

      <h2>Vital Signs (${vitals.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Type</th><th>Value</th><th>Unit</th><th>Recorded At</th></tr>
        ${vitals.map(v => `<tr><td>${v.id}</td><td>${v.type}</td><td>${v.value}</td><td>${v.unit}</td><td>${new Date(v.createdAt).toLocaleString()}</td></tr>`).join('')}
      </table>

      <h2>Symptoms (${symptoms.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Name</th><th>Severity</th><th>Description</th><th>Recorded At</th></tr>
        ${symptoms.map(s => `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.severity}/10</td><td>${s.description || 'N/A'}</td><td>${new Date(s.createdAt).toLocaleString()}</td></tr>`).join('')}
      </table>

      <h2>Appointments (${appointments.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Type</th><th>Date & Time</th><th>Notes</th></tr>
        ${appointments.map(a => `<tr><td>${a.id}</td><td>${a.type || 'N/A'}</td><td>${new Date(a.datetime).toLocaleString()}</td><td>${a.notes || 'N/A'}</td></tr>`).join('')}
      </table>

      <h2>Billing (${bills.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Patient</th><th>Amount</th><th>Description</th><th>Status</th><th>Date</th></tr>
        ${bills.map(b => `<tr><td>${b.id}</td><td>${b.Patient?.name || 'N/A'}</td><td>$${b.amount}</td><td>${b.description || 'N/A'}</td><td>${b.status}</td><td>${new Date(b.createdAt).toLocaleDateString()}</td></tr>`).join('')}
      </table>

      <h2>Inventory (${inventory.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Name</th><th>Quantity</th><th>Min Stock Level</th><th>Supplier</th></tr>
        ${inventory.map(i => `<tr><td>${i.id}</td><td>${i.name}</td><td>${i.quantity}</td><td>${i.minStockLevel}</td><td>${i.supplier || 'N/A'}</td></tr>`).join('')}
      </table>

      <h2>Users (${users.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th></tr>
        ${users.map(u => `<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.department || 'N/A'}</td><td>${u.isActive ? 'Active' : 'Inactive'}</td></tr>`).join('')}
      </table>

      <br>
      <p><em>This report was generated from the KALAWATI Hospital Management System database.</em></p>
    `;

    // Email options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: 'KALAWATI HMS - Complete System Data Report',
      html: htmlContent
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`Complete system data sent to ${recipientEmail} by ${req.user.name}`);

    res.json({ message: 'Complete system data sent successfully via email' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Error sending email: ' + error.message });
  }
});

// Helper functions
async function updateBedOccupancy(roomNumber, occupied) {
  // This would update a beds collection - simplified for demo
  console.log(`Room ${roomNumber} ${occupied ? 'occupied' : 'vacated'}`);
}

async function createAlert(type, message, priority) {
  const alert = new Notification({
    type,
    message,
    priority,
    recipient: null // Broadcast to all users
  });
  await alert.save();

  // Emit real-time alert
  io.emit('alert', alert);
}

// Notification helper functions
async function getAllActiveUsers() {
  return await User.findAll({
    where: { isActive: true },
    attributes: ['id', 'name', 'email', 'role']
  });
}

async function sendPatientNotificationToAllUsers(patientId, notificationType, priority = 'medium') {
  try {
    const patient = await Patient.findByPk(patientId);
    if (!patient) return;

    const users = await getAllActiveUsers();
    const message = `New patient ${patient.name} has been ${notificationType === 'patient_created' ? 'registered' : 'admitted'}.`;

    // Create notifications for all users
    const notifications = users.map(user => ({
      type: notificationType,
      title: `Patient ${notificationType === 'patient_created' ? 'Registration' : 'Admission'}`,
      message,
      priority,
      recipientId: user.id,
      relatedEntity: { patientId, patientName: patient.name },
      actionRequired: true,
      actionUrl: `/patient/${patientId}`,
      actionLabel: 'View Patient'
    }));

    await Notification.bulkCreate(notifications);

    // Emit real-time notifications
    notifications.forEach(notification => {
      io.to(notification.recipientId.toString()).emit('notification', notification);
    });

    console.log(`Notifications sent to ${users.length} users for patient ${patient.name}`);
  } catch (error) {
    console.error('Error sending patient notifications:', error);
  }
}

async function sendPatientDataEmailToAllUsers(patientId, includeAllData = false) {
  try {
    const patient = await Patient.findByPk(patientId);
    if (!patient) return;

    const users = await getAllActiveUsers();

    // Get comprehensive patient data
    let admissions = [], medications = [], vitals = [], symptoms = [], appointments = [], bills = [];

    if (includeAllData) {
      [admissions, medications, vitals, symptoms, appointments, bills] = await Promise.all([
        Admission.findAll({ where: { patientId }, include: [{ model: User, as: 'admittingDoctor', attributes: ['name'] }] }),
        Medication.findAll({ where: { patientId }, include: [{ model: User, as: 'prescribedBy', attributes: ['name'] }] }),
        Vital.findAll({ where: { patientId }, order: [['createdAt', 'DESC']], limit: 10 }),
        Symptom.findAll({ where: { patientId }, order: [['createdAt', 'DESC']], limit: 10 }),
        Appointment.findAll({ where: { patientId }, order: [['datetime', 'DESC']], limit: 5 }),
        Billing.findAll({ where: { patientId }, order: [['createdAt', 'DESC']], limit: 5 })
      ]);
    }

    // Generate HTML email content
    const htmlContent = `
      <h1>KALAWATI HOSPITAL - Patient Data Notification</h1>
      <p><strong>Patient:</strong> ${patient.name}</p>
      <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>

      <h2>Patient Information</h2>
      <ul>
        <li><strong>Name:</strong> ${patient.name}</li>
        <li><strong>Email:</strong> ${patient.email || 'N/A'}</li>
        <li><strong>Phone:</strong> ${patient.phone || 'N/A'}</li>
        <li><strong>Date of Birth:</strong> ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</li>
        <li><strong>Age:</strong> ${patient.age || 'N/A'}</li>
        <li><strong>Gender:</strong> ${patient.gender}</li>
        <li><strong>Blood Type:</strong> ${patient.bloodType || 'N/A'}</li>
        <li><strong>Admission Status:</strong> ${patient.admissionStatus}</li>
      </ul>

      ${admissions.length > 0 ? `
      <h2>Current Admission (${admissions.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>Room</th><th>Ward</th><th>Diagnosis</th><th>Admitting Doctor</th><th>Admission Date</th></tr>
        ${admissions.map(a => `<tr><td>${a.room}</td><td>${a.ward}</td><td>${a.diagnosis}</td><td>${a.admittingDoctor?.name || 'N/A'}</td><td>${new Date(a.admissionDate).toLocaleDateString()}</td></tr>`).join('')}
      </table>
      ` : ''}

      ${medications.length > 0 ? `
      <h2>Current Medications (${medications.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Prescribed By</th><th>Start Date</th></tr>
        ${medications.map(m => `<tr><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.prescribedBy?.name || 'N/A'}</td><td>${new Date(m.startDate).toLocaleDateString()}</td></tr>`).join('')}
      </table>
      ` : ''}

      ${vitals.length > 0 ? `
      <h2>Recent Vital Signs (${vitals.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>Type</th><th>Value</th><th>Unit</th><th>Recorded At</th></tr>
        ${vitals.map(v => `<tr><td>${v.type}</td><td>${v.value}</td><td>${v.unit}</td><td>${new Date(v.createdAt).toLocaleString()}</td></tr>`).join('')}
      </table>
      ` : ''}

      ${symptoms.length > 0 ? `
      <h2>Active Symptoms (${symptoms.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>Name</th><th>Severity</th><th>Description</th><th>Reported At</th></tr>
        ${symptoms.map(s => `<tr><td>${s.name}</td><td>${s.severity}/10</td><td>${s.description || 'N/A'}</td><td>${new Date(s.createdAt).toLocaleString()}</td></tr>`).join('')}
      </table>
      ` : ''}

      ${appointments.length > 0 ? `
      <h2>Upcoming Appointments (${appointments.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>Type</th><th>Date & Time</th><th>Department</th><th>Status</th></tr>
        ${appointments.map(a => `<tr><td>${a.type}</td><td>${new Date(a.datetime).toLocaleString()}</td><td>${a.department}</td><td>${a.status}</td></tr>`).join('')}
      </table>
      ` : ''}

      ${bills.length > 0 ? `
      <h2>Recent Billing (${bills.length})</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>Bill Number</th><th>Amount</th><th>Status</th><th>Date</th></tr>
        ${bills.map(b => `<tr><td>${b.billNumber}</td><td>$${b.totalAmount}</td><td>${b.status}</td><td>${new Date(b.createdAt).toLocaleDateString()}</td></tr>`).join('')}
      </table>
      ` : ''}

      <br>
      <p><em>This notification was automatically generated by the KALAWATI Hospital Management System.</em></p>
    `;

    // Send email to all users
    const emailPromises = users.map(user => {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: `KALAWATI HMS - Patient ${includeAllData ? 'Admission' : 'Registration'}: ${patient.name}`,
        html: htmlContent
      };
      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    console.log(`Patient data emails sent to ${users.length} users for patient ${patient.name}`);
  } catch (error) {
    console.error('Error sending patient data emails:', error);
  }
}

function isAbnormalVital(vital) {
  // Simple abnormality checks - in real system, this would be more sophisticated
  const { type, value } = vital;

  switch (type) {
    case 'Blood Pressure':
      const [systolic, diastolic] = value.split('/').map(Number);
      return systolic > 180 || systolic < 90 || diastolic > 110 || diastolic < 60;
    case 'Heart Rate':
      return value > 100 || value < 60;
    case 'Temperature':
      return value > 100.4 || value < 97;
    default:
      return false;
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Join user-specific room for targeted notifications
  socket.on('join', (userId) => {
    socket.join(userId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
