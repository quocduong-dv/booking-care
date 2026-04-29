'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Insurance (BHYT) on user + booking
        await queryInterface.addColumn('users', 'insuranceNumber', {
            type: Sequelize.STRING(50), allowNull: true
        });
        await queryInterface.addColumn('users', 'insuranceProvider', {
            type: Sequelize.STRING(100), allowNull: true
        });
        // Loyalty points
        await queryInterface.addColumn('users', 'loyaltyPoints', {
            type: Sequelize.INTEGER, allowNull: false, defaultValue: 0
        });
        // Per-booking insurance snapshot + points earned
        await queryInterface.addColumn('bookings', 'insuranceNumber', {
            type: Sequelize.STRING(50), allowNull: true
        });
        await queryInterface.addColumn('bookings', 'pointsEarned', {
            type: Sequelize.INTEGER, allowNull: false, defaultValue: 0
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn('users', 'insuranceNumber');
        await queryInterface.removeColumn('users', 'insuranceProvider');
        await queryInterface.removeColumn('users', 'loyaltyPoints');
        await queryInterface.removeColumn('bookings', 'insuranceNumber');
        await queryInterface.removeColumn('bookings', 'pointsEarned');
    }
};
