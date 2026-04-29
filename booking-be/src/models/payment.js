'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Payment extends Model {
        static associate(models) {
            Payment.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'bookingData' });
            Payment.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'patientData' });
            Payment.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData' });
        }
    }
    Payment.init({
        bookingId: DataTypes.INTEGER,
        patientId: DataTypes.INTEGER,
        doctorId: DataTypes.INTEGER,
        amount: DataTypes.DECIMAL(12, 0),
        currency: DataTypes.STRING,
        method: DataTypes.STRING,
        status: DataTypes.STRING,
        transactionId: DataTypes.STRING,
        txnRef: DataTypes.STRING,
        responseCode: DataTypes.STRING,
        bankCode: DataTypes.STRING,
        paymentUrl: DataTypes.TEXT,
        rawResponse: DataTypes.TEXT,
        paidAt: DataTypes.DATE,
        refundedAt: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Payment',
        tableName: 'payments',
        freezeTableName: true
    });
    return Payment;
};
