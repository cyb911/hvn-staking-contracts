// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./IBlacklistPolicy.sol";


contract BlacklistPolicyUpgradeable is Initializable, AccessControlUpgradeable,UUPSUpgradeable,IBlacklistPolicy {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    // keccak256(abi.encode(uint256(keccak256("heaven.blacklist.storage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant BLACKLIST_STORAGE_LOCATION = 0x1c7d8b71a63e13bb2f0b9c4c0b3b07d2e6cdb5d44b1c0a000000000000000000;
    
    struct BlacklistStorage {
        mapping(address => bool) blacklisted;
    }

    function _getStorage() private pure returns (BlacklistStorage storage $) {
        assembly {
            $.slot := BLACKLIST_STORAGE_LOCATION
        }
    }

    function initialize(address admin) external initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, admin);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    event Blacklisted(address indexed account);
    event UnBlacklisted(address indexed account);

    function blacklist(address account) external onlyRole(MANAGER_ROLE) {
        _getStorage().blacklisted[account] = true;
        emit Blacklisted(account);
    }

    function unblacklist(address account) external onlyRole(MANAGER_ROLE) {
        _getStorage().blacklisted[account] = false;
        emit UnBlacklisted(account);
    }

    function isBlocked(address from, address to) external view override returns (bool) {
        BlacklistStorage storage $ = _getStorage();

        if (from != address(0) && $.blacklisted[from]) return true;
        if (to != address(0) && $.blacklisted[to]) return true;

        return false;
    }

    function isBlocked(address from, address to) external view override returns (bool) {
        BlacklistStorage storage $ = _getStorage();

        if (from != address(0) && $.blacklisted[from]) return true;
        if (to != address(0) && $.blacklisted[to]) return true;

        return false;
    }
}