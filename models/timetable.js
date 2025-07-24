'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Timetable extends Model {
    static associate(models) {
      Timetable.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Timetable.init({
    userId: DataTypes.INTEGER,
    time: DataTypes.STRING,
    subject: DataTypes.STRING,
    status: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    comment: DataTypes.TEXT,
    total_number_of_classes: DataTypes.INTEGER,
    attended: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Timetable',
  });

  return Timetable;
};
