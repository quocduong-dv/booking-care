'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('reviews', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            bookingId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true
            },
            patientId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            doctorId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            rating: {
                type: Sequelize.TINYINT,
                allowNull: false
            },
            comment: {
                type: Sequelize.TEXT
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
        await queryInterface.addIndex('reviews', ['doctorId']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('reviews');
    }
};
