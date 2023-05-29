require("@nomicfoundation/hardhat-toolbox"); 
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
//require("./tasks/block-number");
require("hardhat-gas-reporter");
require("hardhat-deploy");

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking:{
        url: MAINNET_RPC_URL,
      },
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
  },
  // solidity: "0.8.18",
  solidity: {
    compilers: [
      {version: "0.8.18"},
      {version: "0.8.0"},
      {version: "0.6.6"},
      {version: "0.6.12"},
      {version: "0.4.19"},
    ],
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },
};