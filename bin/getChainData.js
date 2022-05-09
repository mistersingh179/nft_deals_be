require("dotenv").config({ debug: true, override: true });

const sequelize = require("./database/sequelize");
const User = require("./models/user");
sequelize.sync({alter: true});

const ethers = require("ethers");
const deployedContracts = require("../contracts/hardhat_contracts.json");

const rpc_url = {
  localhost: "http://localhost:8545",
  rinkeby: `https://rinkeby.infura.io/v3/${process.env.RINKEBY_INFURA_KEY}`,
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
    rpc_url[process.env.NETWORK_NAME],
    {
      etherscan: process.env.ETHERSCAN_API_KEY,
      infura: {
        projectId: process.env.RINKEBY_INFURA_KEY,
        projectSecret: process.env.RINKEBY_DEPLOYER_PRIV_KEY,
      },
      alchemy: process.env.ALCHEMY_API_KEY,
      pocket: "-",
      ankr: "-",
    }
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
    const bidHandler = (
      fromAddress,
      previousWinnerAddress,
      amount,
      secondsLeftInAuction,
      eventObj
    ) => {
      if (eventObj.blockNumber <= startBlockNumber){
        console.log("ignoring old event of blockNumber: ", eventObj.blockNumber);
        return
      }
      console.log("for auction: ", auctionAddress, " got bid: ");
      console.log("from: ", fromAddress);
      console.log("previousWinnerAddress: ", previousWinnerAddress);
      console.log("amount: ", amount.toString());
      console.log("secondsLeftInAuction: ", secondsLeftInAuction.toString());
      console.log("blockNumber: ", eventObj.blockNumber)
    };
    auctionContract.on("Bid", bidHandler);
  };

  console.log("we have auctionFactory address: ", auctionFactory.address);
  const auctionAddresses = await auctionFactory.auctions();
  auctionAddresses.forEach((auctionAddress) => processAuction(auctionAddress));

  auctionFactory.on("AuctionGenerated", (nftOwner, auctionAddress, eventObj) => {
    if (eventObj.blockNumber <= startBlockNumber){
      console.log("ignoring old AuctionGenerated event of blockNumber: ", eventObj.blockNumber);
      return
    }
    console.log("we got a newly generated auction: ", auctionAddress);
    processAuction(auctionAddress);
  });
};

init().catch((err) => {
  console.error("getChainData failed with: ", err);
});
