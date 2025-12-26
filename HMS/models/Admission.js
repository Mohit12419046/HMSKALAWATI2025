const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Admission = sequelize.define('Admission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patient',
      key: 'id'
    }
  },
  admittingDoctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  room: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bed: DataTypes.STRING,
  floor: DataTypes.STRING,
  ward: {
    type: DataTypes.ENUM('general', 'icu', 'ccu', 'sicu', 'nicu', 'emergency', 'maternity'),
    allowNull: false
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  admissionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dischargeDate: DataTypes.DATE,
  estimatedDischargeDate: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM('admitted', 'discharged', 'transferred'),
    defaultValue: 'admitted'
  },
  admissionType: {
    type: DataTypes.ENUM('emergency', 'elective', 'urgent'),
    defaultValue: 'elective'
  },
  chiefComplaint: DataTypes.TEXT,
  presentingSymptoms: DataTypes.JSON,
  vitalSignsOnAdmission: DataTypes.JSON,
  treatmentPlan: DataTypes.JSON,
  progressNotes: DataTypes.JSON,
  nursingCare: DataTypes.JSON,
  dischargeSummary: DataTypes.JSON,
  complications: DataTypes.JSON,
  consultations: DataTypes.JSON,
  labResults: DataTypes.JSON,
  imagingResults: DataTypes.JSON,
  accompanyingFamily: DataTypes.JSON,
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  insuranceCoverage: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'insurance_pending'),
    defaultValue: 'pending'
  },
  notes: DataTypes.TEXT,
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    { fields: ['patientId'] },
    { fields: ['status'] },
    { fields: ['admissionDate'] },
    { fields: ['ward'] },
    { fields: ['room'] }
  ]
});

// Define associations
Admission.associate = (models) => {
  Admission.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  Admission.belongsTo(models.User, { foreignKey: 'admittingDoctorId', as: 'admittingDoctor' });
};

module.exports = Admission;
