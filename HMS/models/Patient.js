const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Patient = sequelize.define('Patient', {
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
    validate: {
      isEmail: true
    }
  },
  phone: DataTypes.STRING,
  address: DataTypes.JSON,
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  bloodType: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  allergies: DataTypes.JSON,
  chronicConditions: DataTypes.JSON,
  emergencyContact: DataTypes.JSON,
  insurance: DataTypes.JSON,
  medicalHistory: DataTypes.JSON,
  currentMedications: DataTypes.JSON,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  registrationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastVisit: DataTypes.DATE,
  totalVisits: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  preferredDoctorId: DataTypes.INTEGER,
  roomNumber: DataTypes.STRING,
  admissionStatus: {
    type: DataTypes.ENUM('outpatient', 'admitted', 'discharged'),
    defaultValue: 'outpatient'
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
    { fields: ['email'] },
    { fields: ['phone'] },
    { fields: ['name'] },
    { fields: ['admissionStatus'] },
    { fields: ['isActive'] }
  ]
});

// Define associations
Patient.associate = (models) => {
  Patient.belongsTo(models.User, { foreignKey: 'preferredDoctorId', as: 'preferredDoctor' });
};

module.exports = Patient;
