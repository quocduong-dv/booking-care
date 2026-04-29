'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Voucher extends Model {
        static associate(models) { }
    }
    Voucher.init({
        code: DataTypes.STRING,
        description: DataTypes.STRING,
        type: DataTypes.ENUM('percent', 'fixed'),
        value: DataTypes.DECIMAL(12, 0),
        maxDiscount: DataTypes.DECIMAL(12, 0),
        minOrderAmount: DataTypes.DECIMAL(12, 0),
        startDate: DataTypes.DATE,
        endDate: DataTypes.DATE,
        usageLimit: DataTypes.INTEGER,
        usedCount: DataTypes.INTEGER,
        isActive: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Voucher',
        tableName: 'vouchers'
    });
    return Voucher;
};
