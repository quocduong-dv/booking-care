'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Medicine extends Model {
        static associate(models) { }
    }
    Medicine.init({
        name: DataTypes.STRING,
        unit: DataTypes.STRING,
        price: DataTypes.DECIMAL(15, 2),
        stockQty: DataTypes.INTEGER,
        minStock: DataTypes.INTEGER,
        usage: DataTypes.TEXT,
        note: DataTypes.TEXT,
        isActive: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Medicine',
        tableName: 'medicines'
    });
    return Medicine;
};
