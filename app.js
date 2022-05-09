require("dotenv").config({ debug: true, override: true });
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const sequelize = require("./database/sequelize");
const User = require("./models/user");
sequelize.sync({alter: true});
var logger = require("morgan");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;
