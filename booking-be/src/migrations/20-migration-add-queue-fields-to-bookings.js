'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('bookings', 'queueNumber', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
        await queryInterface.addColumn('bookings', 'servedStatus', {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: 'waiting'
        });
        await queryInterface.addColumn('bookings', 'calledAt', {
            type: Sequelize.DATE,
            allowNull: true
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('bookings', 'queueNumber');
        await queryInterface.removeColumn('bookings', 'servedStatus');
        await queryInterface.removeColumn('bookings', 'calledAt');
    }
};
