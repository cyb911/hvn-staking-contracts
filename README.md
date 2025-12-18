# 天堂币质押协议合约

## 📦 项目结构


项目依赖安装  
Hardhat 2：创建项目
```shell
npm install hardhat@2.22.8 --save-dev
npx hardhat --version
npx hardhat
```

openzeppelin
```shell
npm install @openzeppelin/contracts-upgradeable@latest
npm install --save-dev @openzeppelin/hardhat-upgrades
```
环境变量：dotenv
```shell
npm install dotenv --save-dev
```

启动本地网络
```shell
npx hardhat node
```

代币部署
```shell
npx hardhat ignition deploy ignition/modules/HeavenToken.js --network localhost
```
代币升级
```shell
npx hardhat ignition deploy ignition/modules/HeavenTokenUpgradeable.js --network localhost
npx hardhat ignition deploy ignition/modules/HeavenTokenV2Upgrade.js --network localhost
```

测试脚本
代币测试(sepolia)-基础信息验证
```shell
npx hardhat test test/sepolia/base.token.test.js --network sepolia
```

```shell
npx hardhat test test/HeavenToken.test.js --network localhost --grep "BASE"
```