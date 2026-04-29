'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('audit_logs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: { type: Sequelize.INTEGER, allowNull: true },
            roleId: { type: Sequelize.STRING(10), allowNull: true },
            action: { type: Sequelize.STRING(128), allowNull: false },
            method: { type: Sequelize.STRING(8), allowNull: true },
            path: { type: Sequelize.STRING(255), allowNull: true },
            ip: { type: Sequelize.STRING(64), allowNull: true },
            ua: { type: Sequelize.STRING(255), allowNull: true },
            statusCode: { type: Sequelize.INTEGER, allowNull: true },
            metadata: { type: Sequelize.TEXT, allowNull: true },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
        try { await queryInterface.addIndex('audit_logs', ['userId', 'createdAt'], { name: 'audit_user_idx' }); } catch (e) { }
        try { await queryInterface.addIndex('audit_logs', ['action', 'createdAt'], { name: 'audit_action_idx' }); } catch (e) { }
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('audit_logs');
    }
};
