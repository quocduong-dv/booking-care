'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class MedicineBatch extends Model {
        static associate(models) {
            MedicineBatch.belongsTo(models.Medicine, { foreignKey: 'medicineId', as: 'medicineData' });
        }
    }
    MedicineBatch.init({
        medicineId: DataTypes.INTEGER,
        batchNo: DataTypes.STRING,
        expiryDate: DataTypes.DATEONLY,
        manufactureDate: DataTypes.DATEONLY,
        quantity: DataTypes.INTEGER,
        note: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'MedicineBatch',
        tableName: 'medicine_batches'
    });
    return MedicineBatch;
};
