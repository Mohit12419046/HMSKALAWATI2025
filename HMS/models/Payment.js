const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  billId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Billing',
      key: 'id'
    }
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patient',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'insurance', 'government_card'),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  transactionId: DataTypes.STRING,
  referenceNumber: DataTypes.STRING,
  notes: DataTypes.TEXT,
  processedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'completed'
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
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
    { fields: ['billId'] },
    { fields: ['patientId'] },
    { fields: ['paymentMethod'] },
    { fields: ['paymentDate'] },
    { fields: ['status'] }
  ]
});

// Define associations
Payment.associate = (models) => {
  Payment.belongsTo(models.Billing, { foreignKey: 'billId', as: 'bill' });
  Payment.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  Payment.belongsTo(models.User, { foreignKey: 'processedById', as: 'processedBy' });
};

module.exports = Payment;
