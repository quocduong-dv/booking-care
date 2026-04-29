'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('payments', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            bookingId: { type: Sequelize.INTEGER, allowNull: false },
            patientId: { type: Sequelize.INTEGER, allowNull: true },
            doctorId: { type: Sequelize.INTEGER, allowNull: true },
            amount: { type: Sequelize.DECIMAL(12, 0), allowNull: false, defaultValue: 0 },
            currency: { type: Sequelize.STRING, allowNull: false, defaultValue: 'VND' },
            method: { type: Sequelize.STRING, allowNull: false, defaultValue: 'vnpay' },
            status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' },
            transactionId: { type: Sequelize.STRING, allowNull: true },
            txnRef: { type: Sequelize.STRING, allowNull: true },
            responseCode: { type: Sequelize.STRING, allowNull: true },
            bankCode: { type: Sequelize.STRING, allowNull: true },
            paymentUrl: { type: Sequelize.TEXT, allowNull: true },
            rawResponse: { type: Sequelize.TEXT, allowNull: true },
            paidAt: { type: Sequelize.DATE, allowNull: true },
            refundedAt: { type: Sequelize.DATE, allowNull: true },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('payments');
    }
};
