'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        name: 'TranQuocDuong',
        email: 'baoduong@gmail.com',
        age: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'NguyenVanA',
        email: 'vana@gmail.com',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
