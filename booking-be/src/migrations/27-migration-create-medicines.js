'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('medicines', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: { type: Sequelize.STRING(255), allowNull: false },
            unit: { type: Sequelize.STRING(64), allowNull: true },
            price: { type: Sequelize.DECIMAL(15, 2), allowNull: true, defaultValue: 0 },
            stockQty: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            minStock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            usage: { type: Sequelize.TEXT, allowNull: true },
            note: { type: Sequelize.TEXT, allowNull: true },
            isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
        try { await queryInterface.addIndex('medicines', ['name'], { name: 'medicines_name_idx' }); } catch (e) { }
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('medicines');
    }
};
