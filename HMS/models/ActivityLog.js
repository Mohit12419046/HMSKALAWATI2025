const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const ActivityLog = sequelize.define('ActivityLog', {
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
  action: {
    type: DataTypes.ENUM(
      'login', 'logout', 'create_user', 'update_user', 'delete_user', 'update_user_status',
      'create_patient', 'update_patient', 'delete_patient',
      'admit_patient', 'discharge_patient', 'transfer_patient',
      'create_medication', 'update_medication', 'delete_medication',
      'create_appointment', 'update_appointment', 'cancel_appointment',
      'create_bill', 'update_bill', 'delete_bill',
      'add_inventory', 'update_inventory', 'remove_inventory',
      'create_vital', 'update_vital',
      'create_symptom', 'update_symptom',
      'send_patient_data', 'generate_report',
      'emergency_alert', 'system_backup', 'system_restore'
    ),
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ipAddress: DataTypes.STRING,
  userAgent: DataTypes.TEXT,
  sessionId: DataTypes.STRING,
  relatedEntity: DataTypes.JSON,
  oldValues: DataTypes.JSON,
  newValues: DataTypes.JSON,
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  errorMessage: DataTypes.TEXT,
  metadata: DataTypes.JSON,
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
    { fields: ['action'] },
    { fields: ['createdAt'] }
  ]
});

// Define associations
ActivityLog.associate = (models) => {
  ActivityLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = ActivityLog;
