'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('lab_results', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            bookingId: { type: Sequelize.INTEGER, allowNull: true },
            patientId: { type: Sequelize.INTEGER, allowNull: false },
            doctorId: { type: Sequelize.INTEGER, allowNull: true },
            testType: { type: Sequelize.STRING(100), allowNull: false },
            testDate: { type: Sequelize.STRING(20), allowNull: true },
            resultText: { type: Sequelize.TEXT, allowNull: true },
            fileUrl: { type: Sequelize.TEXT('long'), allowNull: true },
            fileName: { type: Sequelize.STRING(255), allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });
        try { await queryInterface.addIndex('lab_results', ['patientId'], { name: 'lab_patient_idx' }); } catch (e) { }
        try { await queryInterface.addIndex('lab_results', ['bookingId'], { name: 'lab_booking_idx' }); } catch (e) { }
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('lab_results');
    }
};
