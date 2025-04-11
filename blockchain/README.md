# TimeLockWallet Smart Contract

A Solidity smart contract that allows users to lock ETH for a specified time period with optional early withdrawal penalties.

## Features

- Lock ETH for a customizable time period
- Early withdrawal with a 5% penalty fee
- View all locks and their status
- Get remaining time until locks expire
- Secure implementation with OpenZeppelin libraries

## Directory Structure

- `TimeLockedWallet.sol` - Main contract source code
- `compile.js` - Script to compile the contract
- `deploy.js` - Script to deploy the contract and update frontend
- `build/` - Compiled contract artifacts (ABI, bytecode)
- `.env.example` - Example environment variables

## Requirements

- Node.js (v14+)
- npm or yarn
- An Ethereum wallet with testnet ETH (for deployment)
- Alchemy or Infura API key

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

3. Edit the `.env` file with your credentials:
   ```
   ETH_PROVIDER_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY_WITHOUT_0X_PREFIX
   NETWORK=sepolia
   ```

## Compilation

Compile the smart contract:
```
npm run compile
```

This creates compiled contract artifacts in the `build/` directory.

## Deployment

Deploy the contract to the Ethereum network:
```
npm run deploy
```

The deployment script will:
- Compile the contract if it hasn't been compiled
- Deploy it to the specified network (Sepolia by default)
- Log the contract address and transaction details
- Update the frontend with the new contract address
- Save deployment info to `deployment-info.json`

## Contract Methods

### Deposit
```solidity
function deposit(uint256 lockPeriod) external payable
```
Lock ETH for a specified time period (in seconds).

### Withdraw
```solidity
function withdraw(uint256 lockId, bool allowEarly) external
```
Withdraw locked funds. Set `allowEarly` to true to withdraw before the lock period expires (5% penalty applies).

### GetUserLocks
```solidity
function getUserLocks(address user) external view returns (Lock[] memory)
```
Get all locks created by a specific user.

### GetRemainingTime
```solidity
function getRemainingTime(address user, uint256 lockId) external view returns (uint256)
```
Get the remaining time (in seconds) until a lock expires.

## Security Features

- ReentrancyGuard to prevent reentrancy attacks
- Owner controls for emergency functions
- Explicit withdrawal pattern
- Proper event emissions for transparency 