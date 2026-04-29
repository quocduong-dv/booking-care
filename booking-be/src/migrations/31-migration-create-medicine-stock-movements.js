'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('medicine_stock_movements', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            medicineId: { type: Sequelize.INTEGER, allowNull: false },
            delta: { type: Sequelize.INTEGER, allowNull: false },
            prevQty: { type: Sequelize.INTEGER, allowNull: false },
            newQty: { type: Sequelize.INTEGER, allowNull: false },
            reason: { type: Sequelize.STRING(500), allowNull: true },
            userId: { type: Sequelize.INTEGER, allowNull: true },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
        try { await queryInterface.addIndex('medicine_stock_movements', ['medicineId'], { name: 'msm_medicineId_idx' }); } catch (e) { }
        try { await queryInterface.addIndex('medicine_stock_movements', ['createdAt'], { name: 'msm_createdAt_idx' }); } catch (e) { }
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('medicine_stock_movements');
    }
};
