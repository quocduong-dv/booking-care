'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Message extends Model {
        static associate(models) {
            Message.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'bookingData' });
        }
    }
    Message.init({
        bookingId: DataTypes.INTEGER,
        senderId: DataTypes.INTEGER,
        senderRole: DataTypes.STRING,
        content: DataTypes.TEXT,
        isRead: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Message',
        tableName: 'messages',
        freezeTableName: true
    });
    return Message;
};
