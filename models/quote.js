'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Quote extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  
  Quote.init(
    {
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Quote',
      tableName: 'quotes',
      timestamps: true,
    }
  );

  return Quote;
};
