'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        try { await queryInterface.removeColumn('histories', 'description'); } catch (e) { }
        try { await queryInterface.removeColumn('histories', 'files'); } catch (e) { }
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('histories', 'description', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        await queryInterface.addColumn('histories', 'files', {
            type: Sequelize.TEXT,
            allowNull: true
        });
    }
};
