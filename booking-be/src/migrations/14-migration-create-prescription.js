'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('prescriptions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            doctorId: {
                type: Sequelize.INTEGER
            },
            patientId: {
                type: Sequelize.INTEGER
            },
            patientName: {
                type: Sequelize.STRING
            },
            patientEmail: {
                type: Sequelize.STRING
            },
            patientPhone: {
                type: Sequelize.STRING
            },
            diagnosis: {
                type: Sequelize.TEXT
            },
            note: {
                type: Sequelize.TEXT
            },
            date: {
                type: Sequelize.STRING
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
        await queryInterface.dropTable('prescriptions');
    }
};
