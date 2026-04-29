'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Review extends Model {
        static associate(models) {
            Review.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'bookingData' });
            Review.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'patientData' });
            Review.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData' });
        }
    }
    Review.init({
        bookingId: DataTypes.INTEGER,
        patientId: DataTypes.INTEGER,
        doctorId: DataTypes.INTEGER,
        rating: DataTypes.TINYINT,
        comment: DataTypes.TEXT,
        isApproved: DataTypes.BOOLEAN,
        moderationNote: DataTypes.STRING,
        doctorReply: DataTypes.TEXT,
        doctorReplyAt: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Review',
        tableName: 'reviews',
        freezeTableName: true
    });
    return Review;
};
