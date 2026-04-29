'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DoctorLeave extends Model {
        static associate(models) {
            DoctorLeave.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData' });
        }
    }
    DoctorLeave.init({
        doctorId: DataTypes.INTEGER,
        startDate: DataTypes.STRING,
        endDate: DataTypes.STRING,
        leaveType: DataTypes.STRING,
        reason: DataTypes.TEXT,
        status: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'DoctorLeave',
        tableName: 'doctor_leaves',
    });
    return DoctorLeave;
};
