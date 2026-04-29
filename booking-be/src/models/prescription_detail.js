'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PrescriptionDetail extends Model {
        static associate(models) {
            PrescriptionDetail.belongsTo(models.Prescription, { foreignKey: 'prescriptionId', targetKey: 'id', as: 'prescriptionData' })
        }
    }
    PrescriptionDetail.init({
        prescriptionId: DataTypes.INTEGER,
        name: DataTypes.STRING,
        dosage: DataTypes.STRING,
        usage: DataTypes.STRING,
        quantity: DataTypes.INTEGER,
        unit: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'PrescriptionDetail',
        tableName: 'prescription_details',
    });
    return PrescriptionDetail;
};
