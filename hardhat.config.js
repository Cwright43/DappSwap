require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        enabled: true,
        url:  `https://eth-mainnet.g.alchemy.com/v2/${process.env.MAINNET_RPC_URL}`,
      }
    }
  }
};