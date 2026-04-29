'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('doctor_leaves', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            doctorId: {
                type: Sequelize.INTEGER
            },
            startDate: {
                type: Sequelize.STRING
            },
            endDate: {
                type: Sequelize.STRING
            },
            leaveType: {
                type: Sequelize.STRING
            },
            reason: {
                type: Sequelize.TEXT
            },
            status: {
                type: Sequelize.STRING,
                defaultValue: 'pending'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('doctor_leaves');
    }
};
