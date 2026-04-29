'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('handbooks', 'tags', {
            type: Sequelize.STRING(500), allowNull: true
        });
        await queryInterface.addColumn('handbooks', 'category', {
            type: Sequelize.STRING(100), allowNull: true
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn('handbooks', 'tags');
        await queryInterface.removeColumn('handbooks', 'category');
    }
};
