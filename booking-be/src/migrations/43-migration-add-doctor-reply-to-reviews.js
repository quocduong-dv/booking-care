'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('reviews', 'doctorReply', {
            type: Sequelize.TEXT, allowNull: true
        });
        await queryInterface.addColumn('reviews', 'doctorReplyAt', {
            type: Sequelize.DATE, allowNull: true
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn('reviews', 'doctorReply');
        await queryInterface.removeColumn('reviews', 'doctorReplyAt');
    }
};
