'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class History extends Model {
        static associate(models) {
            History.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'patientData' });
            History.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData' });
            History.belongsTo(models.Booking, { foreignKey: 'bookingId', targetKey: 'id', as: 'bookingData' });
        }
    }
    History.init({
        bookingId: DataTypes.INTEGER,
        patientId: DataTypes.INTEGER,
        doctorId: DataTypes.INTEGER,
        chiefComplaint: DataTypes.TEXT,
        symptoms: DataTypes.TEXT,
        diagnosis: DataTypes.TEXT,
        treatment: DataTypes.TEXT,
        vitalSigns: DataTypes.TEXT,
        notes: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'History',
        tableName: 'histories',
    });
    return History;
};
