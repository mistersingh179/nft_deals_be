var path = require('path');
const { Sequelize } = require('sequelize');
require("dotenv").config({ debug: true, override: true });
const sequelize = new Sequelize(process.env.DATABASE_URL);

const init = async () => {
  await sequelize.authenticate();
}

init();