const { ethers, network } = require("hardhat");
require("dotenv").config();

/**
 * 智能获取测试账户
 * - 本地链：ethers.getSigners()
 * - 测试链 / 主网：使用 .env 私钥
 */
async function getSignersSmart() {
    if (network.name === "localhost" || network.name === "hardhat") {
        // 本地环境 → 使用内置账户
        const [ owner, manager, minter, user, feeRecipient, ] = await ethers.getSigners();
        return { owner,manager,minter,user,feeRecipient, };
    }

    // 真实网络（sepolia/mainnet）→ 使用环境变量里的私钥
    if (!process.env.ADMIN_KEY) {
        throw new Error("ADMIN_KEY not set in .env");
    }
    const provider = ethers.provider;

    const owner = new ethers.Wallet(process.env.ADMIN_KEY, provider);

    // 其他角色：可选
    const manager = process.env.MANAGER_KEY 
        ? new ethers.Wallet(process.env.MANAGER_KEY, provider)
        : owner;

    const minter = process.env.MINTER_KEY 
        ? new ethers.Wallet(process.env.MINTER_KEY, provider)
        : owner;

    const user = process.env.USER_KEY 
        ? new ethers.Wallet(process.env.USER_KEY, provider)
        : owner;

    const feeRecipient = process.env.FEE_KEY
        ? new ethers.Wallet(process.env.FEE_KEY, provider)
        : owner;

    return { owner,manager,minter,user,feeRecipient, };
}

module.exports = {
  getSignersSmart,
};