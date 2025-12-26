const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  genericName: DataTypes.STRING,
  category: {
    type: DataTypes.ENUM('medication', 'medical_supplies', 'equipment', 'consumables', 'laboratory', 'surgical'),
    allowNull: false
  },
  subcategory: DataTypes.STRING,
  description: DataTypes.TEXT,
  manufacturer: DataTypes.STRING,
  batchNumber: DataTypes.STRING,
  serialNumber: DataTypes.STRING,
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  unit: {
    type: DataTypes.ENUM('tablets', 'capsules', 'ml', 'mg', 'units', 'pieces', 'boxes', 'bottles'),
    allowNull: false
  },
  minStockLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  maxStockLevel: DataTypes.INTEGER,
  reorderPoint: DataTypes.INTEGER,
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  sellingPrice: DataTypes.DECIMAL(10, 2),
  expiryDate: DataTypes.DATE,
  manufactureDate: DataTypes.DATE,
  location: DataTypes.JSON,
  supplier: DataTypes.JSON,
  status: {
    type: DataTypes.ENUM('active', 'expired', 'discontinued', 'low_stock', 'out_of_stock'),
    defaultValue: 'active'
  },
  barcode: DataTypes.STRING,
  qrCode: DataTypes.STRING,
  usageInstructions: DataTypes.TEXT,
  storageConditions: DataTypes.TEXT,
  sideEffects: DataTypes.JSON,
  contraindications: DataTypes.JSON,
  lastStockUpdate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  stockHistory: DataTypes.JSON,
  alerts: DataTypes.JSON,
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
    { fields: ['name'] },
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['expiryDate'] },
    { fields: ['quantity'] }
  ]
});

module.exports = Inventory;
