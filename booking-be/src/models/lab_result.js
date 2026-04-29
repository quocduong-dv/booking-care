'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class LabResult extends Model {
        static associate(models) {
            LabResult.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'patientData' });
            LabResult.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData' });
            LabResult.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'bookingData' });
        }
    }
    LabResult.init({
        bookingId: DataTypes.INTEGER,
        patientId: DataTypes.INTEGER,
        doctorId: DataTypes.INTEGER,
        testType: DataTypes.STRING,
        testDate: DataTypes.STRING,
        resultText: DataTypes.TEXT,
        fileUrl: DataTypes.TEXT('long'),
        fileName: DataTypes.STRING,
        notes: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'LabResult',
        tableName: 'lab_results'
    });
    return LabResult;
};
