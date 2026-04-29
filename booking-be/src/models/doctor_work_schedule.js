'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DoctorWorkSchedule extends Model {
        static associate(models) {
            DoctorWorkSchedule.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData' });
        }
    }
    DoctorWorkSchedule.init({
        doctorId: DataTypes.INTEGER,
        weekStart: DataTypes.STRING,
        dayOfWeek: DataTypes.STRING,
        shift: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'DoctorWorkSchedule',
        tableName: 'doctor_work_schedules',
    });
    return DoctorWorkSchedule;
};
