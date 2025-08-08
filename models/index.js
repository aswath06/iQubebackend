'use strict';

require('dotenv').config();
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const basename = path.basename(__filename);
const db = {};

// Initialize Sequelize with DB credentials
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // set to true if you want SQL queries logged
  }
);

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models manually
db.User = require('./user')(sequelize, DataTypes);
db.SocialMedia = require('./socialmedia')(sequelize, DataTypes);
db.Timetable = require('./timetable')(sequelize, DataTypes);
db.Note = require('./note')(sequelize, DataTypes);
db.Todo = require('./todo')(sequelize, DataTypes);
db.Quote = require('./quote')(sequelize, DataTypes);  // <-- Add this line

// Let each model define its own associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
