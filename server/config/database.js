const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
// Defaults to PostgreSQL, but can use SQLite for development
const sequelize = process.env.DB_TYPE === 'sqlite' 
  ? new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false
    })
  : new Sequelize(
      process.env.DB_NAME || 'ivycrm',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false
      }
    );

module.exports = sequelize;

