const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('system', 'medical', 'billing', 'appointment', 'inventory', 'emergency', 'broadcast', 'vital_abnormal', 'symptom_high', 'low_stock'),
    allowNull: false
  },
  title: DataTypes.STRING,
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  recipientId: DataTypes.INTEGER,
  senderId: DataTypes.INTEGER,
  relatedEntity: DataTypes.JSON,
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: DataTypes.DATE,
  actionRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  actionUrl: DataTypes.STRING,
  actionLabel: DataTypes.STRING,
  expiresAt: DataTypes.DATE,
  metadata: DataTypes.JSON,
  deliveryMethods: DataTypes.JSON,
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'expired'),
    defaultValue: 'pending'
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
    { fields: ['recipientId', 'isRead'] },
    { fields: ['type'] },
    { fields: ['priority'] },
    { fields: ['createdAt'] },
    { fields: ['expiresAt'] }
  ]
});

// Define associations
Notification.associate = (models) => {
  Notification.belongsTo(models.User, { foreignKey: 'recipientId', as: 'recipient' });
  Notification.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
};

module.exports = Notification;
