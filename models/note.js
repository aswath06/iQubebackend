'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    static associate(models) {
      Note.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Note.init({
    userId: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    time: DataTypes.STRING,
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    likes: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Note',
  });

  return Note;
};
