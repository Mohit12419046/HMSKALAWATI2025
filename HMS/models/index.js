const sequelize = require('../database');
const User = require('./User');
const Patient = require('./Patient');
const Admission = require('./Admission');
const Medication = require('./Medication');
const Vital = require('./Vital');
const Symptom = require('./Symptom');
const Appointment = require('./Appointment');
const Billing = require('./Billing');
const Inventory = require('./Inventory');
const Notification = require('./Notification');
const ActivityLog = require('./ActivityLog');
const OpdVisit = require('./OpdVisit');
const GovernmentPatient = require('./GovernmentPatient');
const Payment = require('./Payment');

// Define associations
const models = {
  User,
  Patient,
  Admission,
  Medication,
  Vital,
  Symptom,
  Appointment,
  Billing,
  Inventory,
  Notification,
  ActivityLog,
  OpdVisit,
  GovernmentPatient,
  Payment
};

// Apply associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // Set to true to drop and recreate tables
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  ...models,
  syncDatabase
};
