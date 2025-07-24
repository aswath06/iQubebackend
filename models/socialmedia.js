'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SocialMedia extends Model {
    static associate(models) {
      SocialMedia.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  SocialMedia.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    linkedin: DataTypes.STRING,
    leetcode: DataTypes.STRING,
    codechef: DataTypes.STRING,
    github: DataTypes.STRING,
    hackerrank: DataTypes.STRING,
    hackerearth: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'SocialMedia',
  });

  return SocialMedia;
};
