'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('waitlists', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            patientId: { type: Sequelize.INTEGER, allowNull: false },
            doctorId: { type: Sequelize.INTEGER, allowNull: false },
            preferredDate: { type: Sequelize.STRING(30), allowNull: true },
            preferredTimeType: { type: Sequelize.STRING(50), allowNull: true },
            note: { type: Sequelize.STRING(500), allowNull: true },
            status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'waiting' },
            notifiedAt: { type: Sequelize.DATE, allowNull: true },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });
        try { await queryInterface.addIndex('waitlists', ['doctorId', 'status'], { name: 'waitlist_doctor_status_idx' }); } catch (e) { }
        try { await queryInterface.addIndex('waitlists', ['patientId'], { name: 'waitlist_patient_idx' }); } catch (e) { }
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('waitlists');
    }
};
