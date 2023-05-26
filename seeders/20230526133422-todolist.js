'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('todolists', [
      {
        task: 'TPA 1',
        task_description: 'Membuat personal website menggunakan HTML dan CSS (Flexbox atau Grid)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        task: 'TPA 2',
        task_description: 'Membuat website BMI Calculator',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        task: 'TPA 3',
        task_description: 'Membuat aplikasi website menampilkan list Movie menggunakan data external API TMDB API',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('todolists', null, {});
  }
};
