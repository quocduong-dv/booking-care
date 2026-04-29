'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('reviews', 'isApproved', {
            type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true
        });
        await queryInterface.addColumn('reviews', 'moderationNote', {
            type: Sequelize.STRING(255), allowNull: true
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn('reviews', 'isApproved');
        await queryInterface.removeColumn('reviews', 'moderationNote');
    }
};
