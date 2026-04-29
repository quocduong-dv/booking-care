'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class AuditLog extends Model {
        static associate(models) { }
    }
    AuditLog.init({
        userId: DataTypes.INTEGER,
        roleId: DataTypes.STRING,
        action: DataTypes.STRING,
        method: DataTypes.STRING,
        path: DataTypes.STRING,
        ip: DataTypes.STRING,
        ua: DataTypes.STRING,
        statusCode: DataTypes.INTEGER,
        metadata: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'audit_logs'
    });
    return AuditLog;
};
