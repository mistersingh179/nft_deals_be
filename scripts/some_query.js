require("dotenv").config({ debug: false, override: true });

var path = require('path');

const { Sequelize } = require('sequelize');
const sequelize = require("../database/sequelize");
const User = require("../models/user");

const init = async () => {
  // await sequelize.sync({alter: true});
  // await sequelize.authenticate();
  // const users = await User.findAll();
  const user = await User.findOne({where: {walletAddress: '0x123'}});
  console.log('user email: ', user.emailAddress);
  if(user){
    console.log(user.toJSON());
  }else{
    console.log('not found');
  }
}

init();