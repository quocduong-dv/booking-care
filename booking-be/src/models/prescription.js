'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Prescription extends Model {
        static associate(models) {
            Prescription.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData' })
            Prescription.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'patientData' })
            Prescription.hasMany(models.PrescriptionDetail, { foreignKey: 'prescriptionId', as: 'medicines' })
        }
    }
    Prescription.init({
        doctorId: DataTypes.INTEGER,
        patientId: DataTypes.INTEGER,
        patientName: DataTypes.STRING,
        patientEmail: DataTypes.STRING,
        patientPhone: DataTypes.STRING,
        diagnosis: DataTypes.TEXT,
        note: DataTypes.TEXT,
        date: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Prescription',
        tableName: 'prescriptions',
    });
    return Prescription;
};
