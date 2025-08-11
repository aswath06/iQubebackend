'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.SocialMedia, { foreignKey: 'userId', as: 'socialMedia' });
      User.hasMany(models.Note, { foreignKey: 'userId', as: 'notes' });
      User.hasMany(models.Todo, { foreignKey: 'userId', as: 'todos' });
      User.hasMany(models.Timetable, { foreignKey: 'userId', as: 'timetables' });
    }
  }

  User.init({
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    phonenumber: DataTypes.STRING,
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    pid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'student', 
    },
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
