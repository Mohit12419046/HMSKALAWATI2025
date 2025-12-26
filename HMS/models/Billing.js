const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Billing = sequelize.define('Billing', {
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
  admissionId: DataTypes.INTEGER,
  appointmentId: DataTypes.INTEGER,
  billNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  billDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dueDate: DataTypes.DATE,
  items: DataTypes.JSON,
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  insurance: DataTypes.JSON,
  payments: DataTypes.JSON,
  totalPaid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  outstandingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'pending'
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  generatedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  approvedById: DataTypes.INTEGER,
  notes: DataTypes.TEXT,
  paymentTerms: DataTypes.TEXT,
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastReminderDate: DataTypes.DATE,
  collectionAgency: DataTypes.JSON,
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
    { fields: ['billNumber'] },
    { fields: ['status'] },
    { fields: ['billDate'] },
    { fields: ['dueDate'] },
    { fields: ['outstandingAmount'] }
  ]
});

// Define associations
Billing.associate = (models) => {
  Billing.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  Billing.belongsTo(models.Admission, { foreignKey: 'admissionId', as: 'admission' });
  Billing.belongsTo(models.Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
  Billing.belongsTo(models.User, { foreignKey: 'generatedById', as: 'generatedBy' });
  Billing.belongsTo(models.User, { foreignKey: 'approvedById', as: 'approvedBy' });
};

module.exports = Billing;
