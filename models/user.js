const sequelize = require("../database/sequelize");
const { Sequelize, DataTypes } = require("sequelize");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    walletAddress: {
      type: DataTypes.STRING,
    },
    emailAddress: {
      type: DataTypes.STRING,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["walletAddress"],
      },
      {
        unique: true,
        fields: ["emailAddress"],
      },
      {
        unique: true,
        fields: ["walletAddress", "emailAddress"],
      },
    ],
  }
);

module.exports = User;
