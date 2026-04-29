'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'resetOtpCode', {
            type: Sequelize.STRING(10), allowNull: true
        });
        await queryInterface.addColumn('users', 'resetOtpExpiresAt', {
            type: Sequelize.DATE, allowNull: true
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn('users', 'resetOtpCode');
        await queryInterface.removeColumn('users', 'resetOtpExpiresAt');
    }
};
