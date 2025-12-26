const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'doctor', 'nurse', 'receptionist', 'patient'),
    allowNull: false
  },
  department: {
    type: DataTypes.ENUM('cardiology', 'neurology', 'orthopedics', 'emergency', 'general', 'administration'),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  phone: DataTypes.STRING,
  address: DataTypes.TEXT,
  dateOfBirth: DataTypes.DATE,
  gender: DataTypes.ENUM('male', 'female', 'other'),
  emergencyContact: DataTypes.JSON,
  qualifications: DataTypes.JSON,
  licenseNumber: DataTypes.STRING,
  shift: DataTypes.ENUM('morning', 'evening', 'night', 'rotating'),
  salary: DataTypes.DECIMAL(10, 2),
  hireDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastLogin: DataTypes.DATE,
  profilePicture: DataTypes.STRING,
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
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['department'] },
    { fields: ['isActive'] }
  ]
});

module.exports = User;
