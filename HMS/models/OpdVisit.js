const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const OpdVisit = sequelize.define('OpdVisit', {
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
  visitDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  purpose: {
    type: DataTypes.ENUM('consultation', 'follow-up', 'check-up', 'prescription_refill', 'test_results', 'vaccination', 'minor_procedure', 'other'),
    defaultValue: 'consultation'
  },
  chiefComplaint: DataTypes.TEXT,
  diagnosis: DataTypes.TEXT,
  treatment: DataTypes.TEXT,
  prescription: DataTypes.JSON, // Array of medications prescribed
  notes: DataTypes.TEXT,
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpDate: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM('waiting', 'in-progress', 'completed', 'cancelled'),
    defaultValue: 'waiting'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  department: {
    type: DataTypes.ENUM('cardiology', 'neurology', 'orthopedics', 'emergency', 'general', 'dermatology', 'ophthalmology', 'ent', 'pediatrics', 'gynecology'),
    defaultValue: 'general'
  },
  room: DataTypes.STRING,
  vitals: DataTypes.JSON,
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
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
    { fields: ['doctorId'] },
    { fields: ['visitDate'] },
    { fields: ['status'] },
    { fields: ['department'] },
    { fields: ['priority'] }
  ]
});

// Define associations
OpdVisit.associate = (models) => {
  OpdVisit.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  OpdVisit.belongsTo(models.User, { foreignKey: 'doctorId', as: 'doctor' });
  OpdVisit.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
};

module.exports = OpdVisit;
