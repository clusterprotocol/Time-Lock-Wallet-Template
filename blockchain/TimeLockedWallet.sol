// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TimeLockedWallet is Ownable, ReentrancyGuard {
    struct Lock {
        uint256 amount;         // Amount of ETH locked
        uint256 lockPeriod;     // Lock period in seconds
        uint256 lockStart;      // Timestamp when the lock started
        uint256 lockEnd;        // Timestamp when the lock ends
        bool withdrawn;         // Whether funds have been withdrawn
    }

    mapping(address => Lock[]) public userLocks; // Mapping of user address to array of locks
    uint256 public constant EARLY_WITHDRAWAL_PENALTY = 5; // 5% penalty (in percentage)

    event Deposit(address indexed user, uint256 amount, uint256 lockPeriod, uint256 lockId);
    event Withdrawal(address indexed user, uint256 amount, uint256 lockId, bool isEarly);
    event PenaltyApplied(address indexed user, uint256 penaltyAmount);

    /**
     * @dev Deposit ETH with a custom lock period
     * @param lockPeriod Duration in seconds to lock the funds
     */
    function deposit(uint256 lockPeriod) external payable nonReentrant {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        require(lockPeriod > 0, "Lock period must be greater than 0");

        uint256 lockId = userLocks[msg.sender].length;
        userLocks[msg.sender].push(Lock({
            amount: msg.value,
            lockPeriod: lockPeriod,
            lockStart: block.timestamp,
            lockEnd: block.timestamp + lockPeriod,
            withdrawn: false
        }));

        emit Deposit(msg.sender, msg.value, lockPeriod, lockId);
    }

    /**
     * @dev Withdraw locked funds after the lock period
     * @param lockId The ID of the lock to withdraw from
     * @param allowEarly Whether to allow early withdrawal with penalty
     */
    function withdraw(uint256 lockId, bool allowEarly) external nonReentrant {
        require(lockId < userLocks[msg.sender].length, "Invalid lock ID");
        Lock storage userLock = userLocks[msg.sender][lockId];
        require(!userLock.withdrawn, "Funds already withdrawn");
        
        if (!allowEarly) {
            require(block.timestamp >= userLock.lockEnd, "Lock period not yet expired");
        }

        uint256 amountToWithdraw = userLock.amount;
        if (allowEarly && block.timestamp < userLock.lockEnd) {
            uint256 penalty = (amountToWithdraw * EARLY_WITHDRAWAL_PENALTY) / 100;
            amountToWithdraw -= penalty;
            emit PenaltyApplied(msg.sender, penalty);
        }

        userLock.withdrawn = true;
        payable(msg.sender).transfer(amountToWithdraw);

        emit Withdrawal(msg.sender, amountToWithdraw, lockId, allowEarly && block.timestamp < userLock.lockEnd);
    }

    /**
     * @dev Get details of a specific lock for a user
     * @param user The address of the user
     * @param lockId The ID of the lock
     * @return Lock details
     */
    function getLock(address user, uint256 lockId) external view returns (Lock memory) {
        require(lockId < userLocks[user].length, "Invalid lock ID");
        return userLocks[user][lockId];
    }

    /**
     * @dev Get all locks for a user
     * @param user The address of the user
     * @return Array of Lock structs
     */
    function getUserLocks(address user) external view returns (Lock[] memory) {
        return userLocks[user];
    }

    /**
     * @dev Get the number of locks for a user
     * @param user The address of the user
     * @return Number of locks
     */
    function getUserLockCount(address user) external view returns (uint256) {
        return userLocks[user].length;
    }

    /**
     * @dev Get remaining time for a lock
     * @param user The address of the user
     * @param lockId The ID of the lock
     * @return Remaining time in seconds, 0 if expired or withdrawn
     */
    function getRemainingTime(address user, uint256 lockId) external view returns (uint256) {
        require(lockId < userLocks[user].length, "Invalid lock ID");
        Lock memory userLock = userLocks[user][lockId];
        
        if (userLock.withdrawn || block.timestamp >= userLock.lockEnd) {
            return 0;
        }
        
        return userLock.lockEnd - block.timestamp;
    }

    // Allow owner to withdraw accidental ETH deposits (emergency function)
    function withdrawEmergency() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Prevent receiving ETH outside of deposit function
    receive() external payable {
        revert("Use deposit function to lock funds");
    }
} 