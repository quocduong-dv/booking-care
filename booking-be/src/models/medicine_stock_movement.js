'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class MedicineStockMovement extends Model {
        static associate(models) {
            MedicineStockMovement.belongsTo(models.Medicine, { foreignKey: 'medicineId', as: 'medicineData' });
            MedicineStockMovement.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id', as: 'userData' });
        }
    }
    MedicineStockMovement.init({
        medicineId: DataTypes.INTEGER,
        delta: DataTypes.INTEGER,
        prevQty: DataTypes.INTEGER,
        newQty: DataTypes.INTEGER,
        reason: DataTypes.STRING,
        userId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'MedicineStockMovement',
        tableName: 'medicine_stock_movements'
    });
    return MedicineStockMovement;
};
