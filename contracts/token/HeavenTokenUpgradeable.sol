// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract HeavenTokenUpgradeable is Initializable, ERC20Upgradeable, OwnableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    // 角色定义
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant MINTER_ROLE  = keccak256("MINTER_ROLE");

    struct HVNStorage {
        uint256 _feeBasicPoints; // 万分比，例如 10 = 0.1%
        uint256 _maxFee;
        address _feeRecipient;
    }

    // keccak256(abi.encode(uint256(keccak256("heavenToken.storage.HVN")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant HVNStorageLocation = 0x50cbf6fc8018fbfe33db73a52a271591b3d4c79a138d69fd06280ca6aa8c5900;

    function _getHVNStorage() private pure returns (HVNStorage storage $) {
        assembly {
            $.slot := HVNStorageLocation
        }
    }

    

    constructor() {
        _disableInitializers(); // 防止逻辑合约被初始化
    }

    /**
     * @dev 初始化函数（代替 constructor）
     */
    function initialize(address owner_) public initializer {
        __ERC20_init("Heaven Token", "HVN");
        __Ownable_init(owner_);
        __AccessControl_init();
        __UUPSUpgradeable_init();

        // 初始铸造
        _mint(owner_, 1_000_000 ether);

        // 初始化角色
        _grantRole(DEFAULT_ADMIN_ROLE, owner_);
        _grantRole(MANAGER_ROLE, owner_);
        _grantRole(MINTER_ROLE, owner_);

        // 角色层级
        _setRoleAdmin(MINTER_ROLE, MANAGER_ROLE);
        _setRoleAdmin(MANAGER_ROLE, DEFAULT_ADMIN_ROLE);

        HVNStorage storage $ = _getHVNStorage();
        $._feeBasicPoints = 0;
        $._maxFee = 0;
        $._feeRecipient = owner_;
    }

    /**
     * @dev UUPS 升级授权
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE){
        
    }

    function feeBasicPoints() public view virtual returns (uint256) {
        HVNStorage storage $ = _getHVNStorage();
        return $._feeBasicPoints;
    }

    function maxFee() public view virtual returns (uint256) {
        HVNStorage storage $ = _getHVNStorage();
        return $._maxFee;
    }

    function feeRecipient() public view virtual returns (address) {
        HVNStorage storage $ = _getHVNStorage();
        return $._feeRecipient;
    }

    /**
     * @dev 铸造函数
     * 只有 MINTER 或 MANAGER 才能调用
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev 设置税收参数
     */
    function setFeeParams(uint256 newBasicPoints, uint256 newMaxFee, address newRecipient) external onlyRole(MANAGER_ROLE) {
        require(newBasicPoints <= 20, "fee too high");
        require(newMaxFee <= 50 ether, "max fee too high");

        HVNStorage storage $ = _getHVNStorage();
        $._feeBasicPoints = newBasicPoints;
        $._maxFee = newMaxFee;
        $._feeRecipient = newRecipient;
    }

    function _update(address from, address to, uint256 amount) internal override {
        HVNStorage storage $ = _getHVNStorage();
        if (from == address(0) || to == address(0)) {
            super._update(from, to, amount);
            return;
        }
        uint256 fee = (amount * $._feeBasicPoints) / 10_000;
        if (fee > $._maxFee) fee = $._maxFee;

        if (fee > 0) {
            super._update(from, $._feeRecipient, fee);
            amount -= fee;
        }

        super._update(from, to, amount);
    }
}

