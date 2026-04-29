'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Handbook extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Handbook.init({
        name: DataTypes.STRING,
        descriptionMarkdown: DataTypes.TEXT,
        descriptionHTML: DataTypes.TEXT,
        image: DataTypes.TEXT,
        tags: DataTypes.STRING,
        category: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Handbook',
        tableName: 'handbooks',
    });
    return Handbook;
};