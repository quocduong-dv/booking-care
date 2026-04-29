'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('prescription_details', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            prescriptionId: {
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            dosage: {
                type: Sequelize.STRING
            },
            usage: {
                type: Sequelize.STRING
            },
            quantity: {
                type: Sequelize.INTEGER
            },
            unit: {
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
        await queryInterface.dropTable('prescription_details');
    }
};
