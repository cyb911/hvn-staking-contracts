const { expect } = require("chai");
const { getSignersSmart } = require("../utils/getSignersSmart");
const { attachHeavenToken } = require("../utils/attachToken");


let token;
let owner;

// 基础信息验证
describe("BASE-基础信息验证", function() {

    before(async function () {
        ({ owner } = await getSignersSmart());
        token = await attachHeavenToken(owner);
    });

    it("合约名称、符号、小数位应正确", async function () {
        expect(await token.name()).to.equal("Heaven Token");
        expect(await token.symbol()).to.equal("HVN");
        expect(await token.decimals()).to.equal(18);
    })

    it.skip("部署时应向部署者铸造 100 万枚代币", async function () {
        const balance = await token.balanceOf(owner.address);
        expect(balance).to.equal(ethers.parseEther("1000000"));
    });
});