const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Medication = sequelize.define('Medication', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  genericName: DataTypes.STRING,
  dosage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  route: {
    type: DataTypes.ENUM('oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'inhalation', 'rectal', 'ocular'),
    allowNull: false
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: DataTypes.STRING,
  prescribedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  prescribedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: DataTypes.DATE,
  indication: DataTypes.TEXT,
  instructions: DataTypes.TEXT,
  sideEffects: DataTypes.JSON,
  interactions: DataTypes.JSON,
  status: {
    type: DataTypes.ENUM('active', 'completed', 'discontinued', 'on-hold'),
    defaultValue: 'active'
  },
  administrationLog: DataTypes.JSON,
  refillCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxRefills: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  pharmacy: DataTypes.STRING,
  cost: DataTypes.DECIMAL(10, 2),
  insuranceCovered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  batchNumber: DataTypes.STRING,
  expiryDate: DataTypes.DATE,
  manufacturer: DataTypes.STRING,
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
    { fields: ['prescribedDate'] },
    { fields: ['startDate'] },
    { fields: ['endDate'] }
  ]
});

// Define associations
Medication.associate = (models) => {
  Medication.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  Medication.belongsTo(models.User, { foreignKey: 'prescribedById', as: 'prescribedBy' });
};

module.exports = Medication;
