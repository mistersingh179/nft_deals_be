require("dotenv").config({ debug: true, override: true });

const chainToName = {
  1: "mainnet",
  4: "rinkeby",
  31337: "localhost",
  80001: "mumbai",
  137: "polygon",
};

const rpcUrl = {
  localhost: "http://localhost:8545",
  rinkeby: `https://rinkeby.infura.io/v3/${process.env.RINKEBY_INFURA_KEY}`,
  mainnet: `https://mainnet.infura.io/v3/${process.env.RINKEBY_INFURA_KEY}`,
  mumbai: `https://polygon-mumbai.infura.io/v3/${process.env.RINKEBY_INFURA_KEY}`,
  polygon: `https://polygon-mainnet.infura.io/v3/${process.env.RINKEBY_INFURA_KEY}`,
};

module.exports = {
  chainToName, rpcUrl
};
