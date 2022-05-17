require("dotenv").config({ debug: true, override: true });
const ethers = require("ethers");

const externalContracts = require("../contracts/external_contracts.js");
const contracts =
    externalContracts['1'].contracts;

console.log('contracts: ', contracts);

const rpc_url = {
  localhost: "http://localhost:8545",
  rinkeby: `https://rinkeby.infura.io/v3/${process.env.RINKEBY_INFURA_KEY}`,
  mainnet: `https://mainnet.infura.io/v3/${process.env.RINKEBY_INFURA_KEY}`
};

console.log(process.env.INFURA_ID);

const init = async () => {
  const provider = ethers.getDefaultProvider(
    rpc_url[process.env.NETWORK_NAME]
  );

  console.log('provider: ', provider);

  const startBlockNumber = await provider.getBlockNumber();
  console.log("startBlockNumber: ", startBlockNumber);

  const weth = new ethers.Contract(
    contracts.WETH.address,
    contracts.WETH.abi,
    provider
  );

  provider.on("poll", (pollId, blockNumber) => {
    console.log("polling | pollId: ", pollId, " blockNumber: ", blockNumber);
  });


  weth.on("Approval", (src, guy, wad) => {
    console.log('we have an approval of: ', src, guy, wad);
  })

  weth.on("Transfer", (src, dst, wad) => {
    console.log('we have an Transfer of: ', src, dst, wad);
  })
}

init()
