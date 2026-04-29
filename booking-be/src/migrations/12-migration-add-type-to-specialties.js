module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn(
                'specialties',
                'type',
                {
                    type: Sequelize.STRING,
                    allowNull: true,
                }
            ),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('specialties', 'type'),
        ]);
    }
};
