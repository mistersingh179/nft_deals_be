var express = require("express");
var router = express.Router();
const User = require("../models/user");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  const users = await User.findAll();
  res.json(users);
});

router.post("/", async (req, res, next) => {
  console.log("we got: ", req.body);
  const { walletAddress, emailAddress } = req.body;
  if (walletAddress && emailAddress) {
    try {
      const user = await User.findOne({
        where: {
          walletAddress: walletAddress,
        },
      });
      if (user) {
        user.emailAddress = emailAddress;
        await user.save();
        console.log("update user: ", user);
      } else {
        await User.create({
          walletAddress: walletAddress,
          emailAddress: emailAddress,
        });
        console.log("created user: ", user);
      }
      res.status(201).send();
    } catch (err) {
      console.log("unable to create user. got error: ", err);
      res.status(422).send();
    }
  } else {
    console.log("missing input params");
    res.status(422).send();
  }
});

router.post("/search", async (req, res, next) => {
  const { walletAddress } = req.body;
  if (!walletAddress) {
    res.status(422).send();
    return;
  }
  const user = await User.findOne({
    where: {
      walletAddress: walletAddress,
    },
  });
  res.json(user);
});

module.exports = router;
