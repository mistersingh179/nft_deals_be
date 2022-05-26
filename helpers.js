const ethers = require("ethers");
const moment = require('moment')

const displayWeiAsEther = (wei, decimals) => {
  try {
    if (decimals == undefined) {
      decimals = 4;
    }
    return ethers.utils.commify(
      parseFloat(ethers.utils.formatEther(wei)).toFixed(decimals)
    );
  } catch (e) {
    return "0";
  }
};

const displayDuration = (secondsLeft) => {
  const durationToExpire = moment.duration(secondsLeft, "seconds");
  return `${durationToExpire.hours()}h ${durationToExpire.minutes()}m ${durationToExpire.seconds()}s`;
};

module.exports = {
  displayWeiAsEther,
  displayDuration
};
