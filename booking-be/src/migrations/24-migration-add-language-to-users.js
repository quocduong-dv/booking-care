'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Users', 'language', {
            type: Sequelize.STRING(4),
            allowNull: true,
            defaultValue: 'vi'
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Users', 'language');
    }
};
