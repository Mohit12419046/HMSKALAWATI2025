const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const GovernmentPatient = sequelize.define('GovernmentPatient', {
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
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  cardType: {
    type: DataTypes.ENUM('health_department', 'government', 'insurance'),
    allowNull: false
  },
  issuedDate: DataTypes.DATE,
  expiryDate: DataTypes.DATE,
  coverageDetails: DataTypes.JSON,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  registeredById: {
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
    { fields: ['cardNumber'] },
    { fields: ['cardType'] },
    { fields: ['isActive'] }
  ]
});

// Define associations
GovernmentPatient.associate = (models) => {
  GovernmentPatient.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  GovernmentPatient.belongsTo(models.User, { foreignKey: 'registeredById', as: 'registeredBy' });
};

module.exports = GovernmentPatient;
