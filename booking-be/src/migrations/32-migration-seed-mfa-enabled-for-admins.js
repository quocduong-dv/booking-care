'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(
            "UPDATE users SET mfaEnabled = 1 WHERE roleId = 'R1'"
        );
    },
    down: async (queryInterface) => {
        await queryInterface.sequelize.query(
            "UPDATE users SET mfaEnabled = 0 WHERE roleId = 'R1'"
        );
    }
};
