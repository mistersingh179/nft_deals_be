require("dotenv").config({ debug: true, override: true });

const sequelize = require("../database/sequelize");
const User = require("../models/user");
sequelize.sync({ alter: true });

const ethers = require("ethers");
const deployedContracts = require("../contracts/hardhat_contracts.json");

const formData = require("form-data");
const Mailgun = require("mailgun.js");
const moment = require("moment");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const rpc_url = {
  localhost: "http://localhost:8545",
  rinkeby: `https://rinkeby.infura.io/v3/${process.env.RINKEBY_INFURA_KEY}`,
  mainnet: `https://mainnet.infura.io/v3/${process.env.RINKEBY_INFURA_KEY}`
};

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

const init = async () => {
  console.log("starting to get chain data");
  console.log(process.env.RINKEBY_INFURA_KEY);
  console.log(process.env.RINKEBY_DEPLOYER_PRIV_KEY);
  console.log(process.env.CHAIN_ID);
  console.log(process.env.NETWORK_NAME);
  console.log(rpc_url[process.env.NETWORK_NAME]);

  const contracts =
    deployedContracts[process.env.CHAIN_ID][process.env.NETWORK_NAME].contracts;

  const provider = ethers.getDefaultProvider(
    rpc_url[process.env.NETWORK_NAME]
  );

  const startBlockNumber = await provider.getBlockNumber();
  console.log("startBlockNumber: ", startBlockNumber);

  provider.on("poll", (pollId, blockNumber) => {
    console.log("polling | pollId: ", pollId, " blockNumber: ", blockNumber);
  });

  const auctionFactory = new ethers.Contract(
    contracts.AuctionFactory.address,
    contracts.AuctionFactory.abi,
    provider
  );

  const processAuction = (auctionAddress) => {
    console.log("processing auction: ", auctionAddress);
    const auctionContract = new ethers.Contract(
      auctionAddress,
      contracts.Auction.abi,
      provider
    );
    const bidHandler = async (
      fromAddress,
      previousWinnerAddress,
      amount,
      secondsLeftInAuction,
      eventObj
    ) => {
      if (eventObj.blockNumber <= startBlockNumber) {
        console.log(
          "ignoring old event of blockNumber: ",
          eventObj.blockNumber
        );
        return;
      }
      console.log("for auction: ", auctionAddress, " got bid: ");
      console.log("from: ", fromAddress);
      console.log("previousWinnerAddress: ", previousWinnerAddress);
      console.log("amount: ", displayWeiAsEther(amount));
      console.log(
        "secondsLeftInAuction: ",
        displayDuration(secondsLeftInAuction.toString())
      );
      console.log("blockNumber: ", eventObj.blockNumber);
      const user = await User.findOne({
        where: { walletAddress: previousWinnerAddress },
      });
      if (user) {
        console.log("found email for the previousWinner: ", user.emailAddress);
        mg.messages
          .create("mail.nftdeals.xyz", {
            from: "Notification-Bot <no-reply@mail.nftdeals.xyz>",
            to: [user.emailAddress],
            subject: "Outbid Notification",
            text:
              "You have been outbid!" +
              ` ${process.env.DOMAIN_ADDRESS}/auction2/${auctionAddress}`,
            template: "outbid_with_refund_message",
            "h:X-Mailgun-Variables": JSON.stringify({
              amount: `${ethers.constants.EtherSymbol} ${displayWeiAsEther(
                amount
              )}`,
              fromAddress: fromAddress,
              blockNumber: eventObj.blockNumber,
              secondsLeftInAuction: displayDuration(
                secondsLeftInAuction.toString()
              ),
              auctionLink: `${process.env.DOMAIN_ADDRESS}/auction2/${auctionAddress}`,
            }),
          })
          .then((msg) => console.log(msg)) // logs response data
          .catch((err) => console.log(err)); // logs any error
      } else {
        console.log("no email found for this wallet.");
      }
    };
    auctionContract.on("Bid", bidHandler);
  };

  console.log("we have auctionFactory address: ", auctionFactory.address);
  const auctionAddresses = await auctionFactory.auctions();
  auctionAddresses.forEach((auctionAddress) => processAuction(auctionAddress));

  auctionFactory.on(
    "AuctionGenerated",
    (nftOwner, auctionAddress, eventObj) => {
      if (eventObj.blockNumber <= startBlockNumber) {
        console.log(
          "ignoring old AuctionGenerated event of blockNumber: ",
          eventObj.blockNumber
        );
        return;
      }
      console.log("we got a newly generated auction: ", auctionAddress);
      processAuction(auctionAddress);
    }
  );
};

init().catch((err) => {
  console.error("getChainData failed with: ", err);
});
