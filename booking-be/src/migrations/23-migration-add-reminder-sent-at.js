'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('bookings', 'reminderSentAt', {
            type: Sequelize.DATE,
            allowNull: true
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('bookings', 'reminderSentAt');
    }
};
