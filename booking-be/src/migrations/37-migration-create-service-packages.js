'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('service_packages', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            name: { type: Sequelize.STRING(255), allowNull: false },
            slug: { type: Sequelize.STRING(255), allowNull: true },
            description: { type: Sequelize.TEXT, allowNull: true },
            priceOriginal: { type: Sequelize.DECIMAL(12, 0), allowNull: true, defaultValue: 0 },
            priceSale: { type: Sequelize.DECIMAL(12, 0), allowNull: false, defaultValue: 0 },
            image: { type: Sequelize.STRING(500), allowNull: true },
            specialtyId: { type: Sequelize.INTEGER, allowNull: true },
            clinicId: { type: Sequelize.INTEGER, allowNull: true },
            includes: { type: Sequelize.TEXT, allowNull: true },
            isFeatured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('service_packages');
    }
};
