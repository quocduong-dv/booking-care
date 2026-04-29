require('dotenv').config();

// Xử lý password: nếu empty string hoặc undefined thì dùng null
const dbPassword = process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== ''
  ? process.env.DB_PASSWORD
  : null;

module.exports = {

  "development": {
    "username": process.env.DB_USERNAME,
    "password": dbPassword,
    "database": process.env.DB_DATABASE_NAME,
    "host": process.env.DB_HOST,
    // "port": parseInt(process.env.DB_PORT) || 3307,
    "port": process.env.DB_PORT || 3307,

    "dialect": process.env.DB_DIALECT,
    "logging": false,
    "query": {
      "raw": true
    },
    "timezone": "+07:00",
    // "dialectOptions": {
    //   "allowPublicKeyRetrieval": true,
    //   "ssl": false
    // }
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}