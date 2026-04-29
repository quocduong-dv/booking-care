'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'mfaEnabled', {
            type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false
        });
        await queryInterface.addColumn('users', 'mfaOtpCode', {
            type: Sequelize.STRING(10), allowNull: true
        });
        await queryInterface.addColumn('users', 'mfaOtpExpiresAt', {
            type: Sequelize.DATE, allowNull: true
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn('users', 'mfaEnabled');
        await queryInterface.removeColumn('users', 'mfaOtpCode');
        await queryInterface.removeColumn('users', 'mfaOtpExpiresAt');
    }
};
