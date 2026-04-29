'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('medicine_batches', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            medicineId: { type: Sequelize.INTEGER, allowNull: false },
            batchNo: { type: Sequelize.STRING(100), allowNull: false },
            expiryDate: { type: Sequelize.DATEONLY, allowNull: false },
            manufactureDate: { type: Sequelize.DATEONLY, allowNull: true },
            quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            note: { type: Sequelize.STRING(500), allowNull: true },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });
        try { await queryInterface.addIndex('medicine_batches', ['medicineId'], { name: 'mb_medicine_idx' }); } catch (e) { }
        try { await queryInterface.addIndex('medicine_batches', ['expiryDate'], { name: 'mb_expiry_idx' }); } catch (e) { }
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('medicine_batches');
    }
};
