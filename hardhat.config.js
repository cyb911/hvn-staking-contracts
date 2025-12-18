require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { RPC_URL, ADMIN_KEY, MANAGER_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: {},
    sepolia: {
      url: RPC_URL,
      accounts: [ADMIN_KEY, MANAGER_KEY]
    }
  }
};
