'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SocialMedia', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      linkedin: {
        type: Sequelize.STRING
      },
      leetcode: {
        type: Sequelize.STRING
      },
      codechef: {
        type: Sequelize.STRING
      },
      github: {
        type: Sequelize.STRING
      },
      hackerrank: {
        type: Sequelize.STRING
      },
      hackerearth: {
        type: Sequelize.STRING
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SocialMedia');
  }
};