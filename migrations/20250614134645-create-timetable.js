'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Timetables', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      time: {
        type: Sequelize.STRING
      },
      subject: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATEONLY
      },
      comment: {
        type: Sequelize.TEXT
      },
      total_number_of_classes: {
        type: Sequelize.INTEGER
      },
      attended: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Timetables');
  }
};