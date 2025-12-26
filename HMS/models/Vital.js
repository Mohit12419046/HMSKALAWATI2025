const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Vital = sequelize.define('Vital', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  patientId: DataTypes.INTEGER,
  type: {
    type: DataTypes.ENUM('Blood Pressure', 'Heart Rate', 'Temperature', 'Respiratory Rate', 'Oxygen Saturation', 'Weight', 'Height', 'BMI', 'Blood Glucose', 'Pain Level'),
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recordedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  recordedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  method: {
    type: DataTypes.ENUM('manual', 'automatic', 'patient_reported'),
    defaultValue: 'manual'
  },
  device: DataTypes.STRING,
  location: {
    type: DataTypes.ENUM('clinic', 'home', 'hospital', 'emergency'),
    defaultValue: 'clinic'
  },
  position: {
    type: DataTypes.ENUM('sitting', 'standing', 'lying_down', 'supine'),
    defaultValue: 'sitting'
  },
  notes: DataTypes.TEXT,
  isAbnormal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  normalRange: DataTypes.JSON,
  severity: {
    type: DataTypes.ENUM('normal', 'mild', 'moderate', 'severe', 'critical'),
    defaultValue: 'normal'
  },
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpNotes: DataTypes.TEXT,
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
    { fields: ['userId'] },
    { fields: ['patientId'] },
    { fields: ['type'] },
    { fields: ['recordedAt'] },
    { fields: ['isAbnormal'] }
  ]
});

// Define associations
Vital.associate = (models) => {
  Vital.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Vital.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  Vital.belongsTo(models.User, { foreignKey: 'recordedById', as: 'recordedBy' });
};

module.exports = Vital;
