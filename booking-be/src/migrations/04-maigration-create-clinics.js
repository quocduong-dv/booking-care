'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        //add colum
        await queryInterface.createTable('clinics', {

            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            address: {
                type: Sequelize.STRING
            },
            name: {
                type: Sequelize.STRING
            },
            descriptionMarkdown: {
                type: Sequelize.TEXT
            },
            descriptionHTML: {
                type: Sequelize.TEXT
            },

            image: {
                type: Sequelize.BLOB('long')
            },

            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('clinics');
    }
};