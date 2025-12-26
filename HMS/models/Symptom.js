const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Symptom = sequelize.define('Symptom', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  severity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  duration: DataTypes.STRING,
  onset: {
    type: DataTypes.ENUM('sudden', 'gradual'),
    defaultValue: 'gradual'
  },
  frequency: {
    type: DataTypes.ENUM('constant', 'intermittent', 'occasional'),
    defaultValue: 'intermittent'
  },
  location: DataTypes.STRING,
  radiation: DataTypes.STRING,
  associatedSymptoms: DataTypes.JSON,
  aggravatingFactors: DataTypes.JSON,
  relievingFactors: DataTypes.JSON,
  reportedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reportedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'resolved', 'improving', 'worsening'),
    defaultValue: 'active'
  },
  assessment: DataTypes.JSON,
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpDate: DataTypes.DATE,
  emergencyFlag: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  category: {
    type: DataTypes.ENUM('cardiovascular', 'respiratory', 'gastrointestinal', 'neurological', 'musculoskeletal', 'dermatological', 'psychological', 'general'),
    defaultValue: 'general'
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
    { fields: ['userId'] },
    { fields: ['patientId'] },
    { fields: ['status'] },
    { fields: ['severity'] },
    { fields: ['reportedAt'] },
    { fields: ['emergencyFlag'] },
    { fields: ['priority'] }
  ]
});

// Define associations
Symptom.associate = (models) => {
  Symptom.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Symptom.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  Symptom.belongsTo(models.User, { foreignKey: 'reportedById', as: 'reportedBy' });
};

module.exports = Symptom;
