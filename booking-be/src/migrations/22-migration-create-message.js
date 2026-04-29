'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('messages', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            bookingId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            senderId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            senderRole: {
                type: Sequelize.STRING,
                allowNull: false
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            isRead: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
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
        await queryInterface.addIndex('messages', ['bookingId', 'createdAt']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('messages');
    }
};
