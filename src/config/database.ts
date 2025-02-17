import { Sequelize } from 'sequelize-typescript';
import { Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT as Dialect,
  logging: false,
  models: [__dirname + '/../models'],
});

export default sequelize;
