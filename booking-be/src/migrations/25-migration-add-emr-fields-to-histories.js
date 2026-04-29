'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('histories', 'bookingId', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
        await queryInterface.addColumn('histories', 'chiefComplaint', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        await queryInterface.addColumn('histories', 'symptoms', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        await queryInterface.addColumn('histories', 'diagnosis', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        await queryInterface.addColumn('histories', 'treatment', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        await queryInterface.addColumn('histories', 'vitalSigns', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        await queryInterface.addColumn('histories', 'notes', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        try {
            await queryInterface.addIndex('histories', ['bookingId'], { name: 'histories_bookingId_idx' });
        } catch (e) { }
        try {
            await queryInterface.addIndex('histories', ['patientId'], { name: 'histories_patientId_idx' });
        } catch (e) { }
    },
    down: async (queryInterface, Sequelize) => {
        try { await queryInterface.removeIndex('histories', 'histories_bookingId_idx'); } catch (e) { }
        try { await queryInterface.removeIndex('histories', 'histories_patientId_idx'); } catch (e) { }
        await queryInterface.removeColumn('histories', 'bookingId');
        await queryInterface.removeColumn('histories', 'chiefComplaint');
        await queryInterface.removeColumn('histories', 'symptoms');
        await queryInterface.removeColumn('histories', 'diagnosis');
        await queryInterface.removeColumn('histories', 'treatment');
        await queryInterface.removeColumn('histories', 'vitalSigns');
        await queryInterface.removeColumn('histories', 'notes');
    }
};
