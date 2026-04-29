'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('vouchers', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            code: { type: Sequelize.STRING(50), allowNull: false, unique: true },
            description: { type: Sequelize.STRING(255), allowNull: true },
            type: { type: Sequelize.ENUM('percent', 'fixed'), allowNull: false, defaultValue: 'fixed' },
            value: { type: Sequelize.DECIMAL(12, 0), allowNull: false, defaultValue: 0 },
            maxDiscount: { type: Sequelize.DECIMAL(12, 0), allowNull: true },
            minOrderAmount: { type: Sequelize.DECIMAL(12, 0), allowNull: true, defaultValue: 0 },
            startDate: { type: Sequelize.DATE, allowNull: true },
            endDate: { type: Sequelize.DATE, allowNull: true },
            usageLimit: { type: Sequelize.INTEGER, allowNull: true },
            usedCount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });
        await queryInterface.addColumn('bookings', 'voucherCode', {
            type: Sequelize.STRING(50), allowNull: true
        });
        await queryInterface.addColumn('bookings', 'discountAmount', {
            type: Sequelize.DECIMAL(12, 0), allowNull: true, defaultValue: 0
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn('bookings', 'discountAmount');
        await queryInterface.removeColumn('bookings', 'voucherCode');
        await queryInterface.dropTable('vouchers');
    }
};
