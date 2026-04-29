'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('notifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            type: {
                type: Sequelize.STRING(32),
                allowNull: false
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            body: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            link: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            data: {
                type: Sequelize.TEXT,
                allowNull: true
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
        try {
            await queryInterface.addIndex('notifications', ['userId', 'isRead'], { name: 'notif_user_read_idx' });
        } catch (e) { }
        try {
            await queryInterface.addIndex('notifications', ['userId', 'createdAt'], { name: 'notif_user_created_idx' });
        } catch (e) { }
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('notifications');
    }
};
