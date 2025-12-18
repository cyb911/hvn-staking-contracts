const { ethers } = require("hardhat");
require("dotenv").config();

async function attachHeavenToken(signer) {
  if (!process.env.HVN_PROXY_ADDR) {
    throw new Error("HVN_PROXY_ADDR not set");
  }

  return await ethers.getContractAt(
    "HeavenTokenUpgradeable",
    process.env.HVN_PROXY_ADDR,
    signer
  );
}

module.exports = { attachHeavenToken };