'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('bookings', 'amount', {
            type: Sequelize.DECIMAL(12, 0),
            allowNull: true,
            defaultValue: 0
        });
        await queryInterface.addColumn('bookings', 'paymentStatus', {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: 'pending'
        });
        await queryInterface.addColumn('bookings', 'paymentMethod', {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: 'cash'
        });
        await queryInterface.addColumn('bookings', 'cancellationReason', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        await queryInterface.addColumn('bookings', 'reason', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('bookings', 'phoneNumber', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('bookings', 'birthday', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('bookings', 'amount');
        await queryInterface.removeColumn('bookings', 'paymentStatus');
        await queryInterface.removeColumn('bookings', 'paymentMethod');
        await queryInterface.removeColumn('bookings', 'cancellationReason');
        await queryInterface.removeColumn('bookings', 'reason');
        await queryInterface.removeColumn('bookings', 'phoneNumber');
        await queryInterface.removeColumn('bookings', 'birthday');
    }
};
