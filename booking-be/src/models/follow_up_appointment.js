'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class FollowUpAppointment extends Model {
        static associate(models) {
            FollowUpAppointment.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'patientData' })
            FollowUpAppointment.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData' })
        }
    }
    FollowUpAppointment.init({
        patientId: DataTypes.INTEGER,
        doctorId: DataTypes.INTEGER,
        previousDate: DataTypes.STRING,
        followUpDate: DataTypes.STRING,
        note: DataTypes.TEXT,
    }, {
        sequelize,
        modelName: 'FollowUpAppointment',
        tableName: 'follow_up_appointments',
    });
    return FollowUpAppointment;
};
