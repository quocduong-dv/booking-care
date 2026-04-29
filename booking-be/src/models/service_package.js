'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ServicePackage extends Model {
        static associate(models) { }
    }
    ServicePackage.init({
        name: DataTypes.STRING,
        slug: DataTypes.STRING,
        description: DataTypes.TEXT,
        priceOriginal: DataTypes.DECIMAL(12, 0),
        priceSale: DataTypes.DECIMAL(12, 0),
        image: DataTypes.STRING,
        specialtyId: DataTypes.INTEGER,
        clinicId: DataTypes.INTEGER,
        includes: DataTypes.TEXT,
        isFeatured: DataTypes.BOOLEAN,
        isActive: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'ServicePackage',
        tableName: 'service_packages'
    });
    return ServicePackage;
};
