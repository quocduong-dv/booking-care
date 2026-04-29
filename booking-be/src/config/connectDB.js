const { Sequelize } = require('sequelize');
require("dotenv").config();

// Option 3: Passing parameters separately (other dialects)
// const sequelize = new Sequelize('quocduong', 'root', null, {
//     host: 'localhost',
//     dialect: 'mysql',
//     "logging": false
// });

console.log('DEBUG:', {
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '' ? '***' : '(empty)',
    DB_DATABASE_NAME: process.env.DB_DATABASE_NAME,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT
});

// Xử lý password: nếu empty string hoặc undefined thì dùng null
const dbPassword = process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== ''
    ? process.env.DB_PASSWORD
    : null;

const sequelize = new Sequelize(
    process.env.DB_DATABASE_NAME,
    process.env.DB_USERNAME,
    dbPassword,
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3307,
        dialect: process.env.DB_DIALECT,
        logging: false,
        query: {
            "raw": true
        },
        timezone: "+07:00"
    }
);


let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
module.exports = connectDB;