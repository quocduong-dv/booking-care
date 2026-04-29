'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Waitlist extends Model {
        static associate(models) {
            Waitlist.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'patientData' });
            Waitlist.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData' });
        }
    }
    Waitlist.init({
        patientId: DataTypes.INTEGER,
        doctorId: DataTypes.INTEGER,
        preferredDate: DataTypes.STRING,
        preferredTimeType: DataTypes.STRING,
        note: DataTypes.STRING,
        status: DataTypes.STRING,
        notifiedAt: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Waitlist',
        tableName: 'waitlists'
    });
    return Waitlist;
};
