const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: DataTypes.INTEGER,
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patient',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  type: {
    type: DataTypes.ENUM('consultation', 'follow-up', 'check-up', 'emergency', 'procedure', 'therapy'),
    defaultValue: 'consultation'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'),
    defaultValue: 'scheduled'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  department: {
    type: DataTypes.ENUM('cardiology', 'neurology', 'orthopedics', 'emergency', 'general', 'dermatology', 'ophthalmology', 'ent'),
    allowNull: false
  },
  room: DataTypes.STRING,
  chiefComplaint: DataTypes.TEXT,
  notes: DataTypes.TEXT,
  preparationInstructions: DataTypes.TEXT,
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpDate: DataTypes.DATE,
  cancelledAt: DataTypes.DATE,
  cancelledById: DataTypes.INTEGER,
  cancellationReason: DataTypes.TEXT,
  rescheduledFromId: DataTypes.INTEGER,
  rescheduledToId: DataTypes.INTEGER,
  vitals: DataTypes.JSON,
  assessment: DataTypes.JSON,
  billing: DataTypes.JSON,
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  lastModifiedById: DataTypes.INTEGER,
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
    { fields: ['datetime'] },
    { fields: ['status'] },
    { fields: ['department'] },
    { fields: ['priority'] }
  ]
});

// Define associations
Appointment.associate = (models) => {
  Appointment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Appointment.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  Appointment.belongsTo(models.User, { foreignKey: 'doctorId', as: 'doctor' });
  Appointment.belongsTo(models.User, { foreignKey: 'cancelledById', as: 'cancelledBy' });
  Appointment.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
  Appointment.belongsTo(models.User, { foreignKey: 'lastModifiedById', as: 'lastModifiedBy' });
  Appointment.belongsTo(models.Appointment, { foreignKey: 'rescheduledFromId', as: 'rescheduledFrom' });
  Appointment.belongsTo(models.Appointment, { foreignKey: 'rescheduledToId', as: 'rescheduledTo' });
};

module.exports = Appointment;
