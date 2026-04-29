'use strict';
require("dotenv").config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.json')[env];
const db = {};


let sequelize;

// Xử lý password: nếu empty string hoặc undefined thì dùng null
// const dbPassword = process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== ''
//   ? process.env.DB_PASSWORD
//   : null;

const customizeConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3308,
  dialect: process.env.DB_DIALECT,
  logging: false,
  query: {
    "raw": true
  },
  timezone: "+07:00"
}

sequelize = new Sequelize(
  process.env.DB_DATABASE_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  customizeConfig
);

// Load models explicitly with correct names
db.Allcode = require('./allcode')(sequelize, Sequelize.DataTypes);
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Markdown = require('./markdown')(sequelize, Sequelize.DataTypes);
db.Doctor_Infor = require('./doctor_infor')(sequelize, Sequelize.DataTypes);
db.Schedule = require('./schedule')(sequelize, Sequelize.DataTypes);
db.Booking = require('./booking')(sequelize, Sequelize.DataTypes);
db.Specialty = require('./specialty')(sequelize, Sequelize.DataTypes);
db.Clinic = require('./clinic')(sequelize, Sequelize.DataTypes);
db.Handbook = require('./handbook')(sequelize, Sequelize.DataTypes);
db.History = require('./history')(sequelize, Sequelize.DataTypes);
db.Doctor_Clinic_Specialty = require('./doctor_clinic_specialty')(sequelize, Sequelize.DataTypes);
db.FollowUpAppointment = require('./follow_up_appointment')(sequelize, Sequelize.DataTypes);
db.Prescription = require('./prescription')(sequelize, Sequelize.DataTypes);
db.PrescriptionDetail = require('./prescription_detail')(sequelize, Sequelize.DataTypes);
db.Payment = require('./payment')(sequelize, Sequelize.DataTypes);
db.Review = require('./review')(sequelize, Sequelize.DataTypes);
db.Message = require('./message')(sequelize, Sequelize.DataTypes);
db.DoctorLeave = require('./doctor_leave')(sequelize, Sequelize.DataTypes);
db.DoctorWorkSchedule = require('./doctor_work_schedule')(sequelize, Sequelize.DataTypes);
db.Notification = require('./notification')(sequelize, Sequelize.DataTypes);
db.Medicine = require('./medicine')(sequelize, Sequelize.DataTypes);
db.MedicineStockMovement = require('./medicine_stock_movement')(sequelize, Sequelize.DataTypes);
db.AuditLog = require('./audit_log')(sequelize, Sequelize.DataTypes);
db.Voucher = require('./voucher')(sequelize, Sequelize.DataTypes);
db.ServicePackage = require('./service_package')(sequelize, Sequelize.DataTypes);
db.LabResult = require('./lab_result')(sequelize, Sequelize.DataTypes);
db.Waitlist = require('./waitlist')(sequelize, Sequelize.DataTypes);
db.MedicineBatch = require('./medicine_batch')(sequelize, Sequelize.DataTypes);

// Call associate methods
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
