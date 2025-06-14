'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Todo.init({
    userId: DataTypes.INTEGER,
    time: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    order: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });

  return Todo;
};
