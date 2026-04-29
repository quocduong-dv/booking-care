'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate(models) {
            Notification.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id', as: 'userData' });
        }
    }
    Notification.init({
        userId: DataTypes.INTEGER,
        type: DataTypes.STRING,
        title: DataTypes.STRING,
        body: DataTypes.TEXT,
        link: DataTypes.STRING,
        data: DataTypes.TEXT,
        isRead: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications'
    });
    return Notification;
};
