const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getSignersSmart } = require("./utils/getSignersSmart");


let token;
let owner;
let manager;
let minter;
let user;
let feeRecipient;



const TOKEN_ADDRESS_PROXY = process.env.HVN_PROXY_ADDR;

before(async function () {
    ({ owner, manager, minter, user, feeRecipient } = await getSignersSmart());
    token = await ethers.getContractAt(
        "HeavenTokenUpgradeable",
        TOKEN_ADDRESS_PROXY,
        owner
    );
});

// 基础信息验证
describe("BASE-基础信息验证", function() {

    it("合约名称、符号、小数位应正确", async function () {
        expect(await token.name()).to.equal("Heaven Token");
        expect(await token.symbol()).to.equal("HVN");
        expect(await token.decimals()).to.equal(18);
    })

    it("部署时应向部署者铸造 100 万枚代币", async function () {
        const balance = await token.balanceOf(owner.address);
        expect(balance).to.equal(ethers.parseEther("1000000"));
    });

    it("部署者应同时拥有 ADMIN / MANAGER / MINTER 角色", async function () {
        const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
        const MANAGER_ROLE = await token.MANAGER_ROLE();
        const MINTER_ROLE = await token.MINTER_ROLE();

        expect(await token.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        expect(await token.hasRole(MANAGER_ROLE, owner.address)).to.be.true;
        expect(await token.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });

    it.skip("管理员可以授予 MANAGER 和 MINTER 角色", async function () {
        await token.grantRole(await token.MANAGER_ROLE(), manager.address);
        await token.grantRole(await token.MINTER_ROLE(), minter.address);

        expect(await token.hasRole(await token.MANAGER_ROLE(), manager.address)).to.be.true;
        expect(await token.hasRole(await token.MINTER_ROLE(), minter.address)).to.be.true;
    });
});

// 角色更换与权限控制
describe("ROLE-角色更换与权限控制测试", function() {

    it("管理员可以撤销 MANAGER 角色", async function () {
            await token.grantRole(
                await token.MANAGER_ROLE(),
                manager.address
            );

            await token.revokeRole(
                await token.MANAGER_ROLE(),
                manager.address
            );

            expect(
                await token.hasRole(await token.MANAGER_ROLE(), manager.address)
            ).to.be.false;
        });
});

// 铸币权限测试
describe("MINT-铸币权限测试", function() {
    it("普通用户不能铸币", async function () {
            await expect(
                token.connect(user).mint(user.address, ethers.parseEther("1"))
            ).to.be.revertedWith(
                `AccessControl: account ${user.address.toLowerCase()} is missing role ${await token.MINTER_ROLE()}`
            );
        });

    it("拥有 MINTER 角色的账户可以铸币", async function () {
            await token.grantRole(await token.MINTER_ROLE(), minter.address);

            await token
                .connect(minter)
                .mint(user.address, ethers.parseEther("100"));

            expect(await token.balanceOf(user.address))
                .to.equal(ethers.parseEther("100"));
        });
});


// 收税测试
describe("TAX-收税测试", function() {
    it("0 税率转账", async function () {
        await token.transfer(user.address, ethers.parseEther("100"));
    
        expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther("100"))
    });
    
    it("有税转账", async function() {
        await token.setFeeParams(
            10, // 0.1%
        ethers.parseEther("50"),
        feeRecipient.address);

        console.log("\n=== Set Fee Params ===");
        console.log("feeBasicPoints:", await token.feeBasicPoints());
        console.log("maxFee:", ethers.formatEther(await token.maxFee()));
        console.log("feeRecipient:", await token.feeRecipient());

        console.log("\n=== Execute Transfer ===");
        const tx = await token.transfer(user.address, ethers.parseEther("100"));
        const receipt = await tx.wait();
        console.log("\n=== Transfer Logs ===");
        for (const log of receipt.logs) {
            try {
                const parsed = token.interface.parseLog(log);
                if (parsed.name === "Transfer") {
                console.log(
                    `Transfer ${parsed.args.from} -> ${parsed.args.to} : ${ethers.formatEther(parsed.args.value)}`
                );
                }
            } catch {}
        }
        
        console.log("\n=== After Transfer ===");
        console.log(
            "owner:",
            ethers.formatEther(await token.balanceOf(owner.address)));

        console.log(
            "user:",
            ethers.formatEther(await token.balanceOf(user.address))
        );

        console.log(
            "feeRecipient:",
            ethers.formatEther(await token.balanceOf(feeRecipient.address))
        );
        const userBalance = await token.balanceOf(user.address);
        const feeBalance = await token.balanceOf(feeRecipient.address);
        console.log("=== TAX RESULT ===");
        console.log("User:", ethers.formatUnits(userBalance, 18));
        console.log("FeeRecipient:", ethers.formatUnits(feeBalance, 18));

    });
});