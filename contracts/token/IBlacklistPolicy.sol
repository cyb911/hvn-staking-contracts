// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBlacklistPolicy {
   function isBlocked(address from, address to) external view returns (bool);
}