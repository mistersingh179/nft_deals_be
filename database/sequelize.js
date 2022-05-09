const { Sequelize } = require("sequelize");

const dialectOptions = {};
if (process.env.NODE_ENV == "production") {
  dialectOptions["ssl"] = {
    require: true,
    rejectUnauthorized: false,
  };
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: dialectOptions,
});

module.exports = sequelize;
