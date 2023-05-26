'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        email: 'hendra@gmail.com',
        password: 'hendra123',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'deki@gmail.com',
        password: 'deki123',
        role: 'developer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'vivi@gmail.com',
        password: 'vivi123',
        role: 'member',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {}); 
  }
};
