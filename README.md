# TimeLockWallet

A decentralized application for locking ETH funds for a specified time period with early withdrawal penalties.

## 🌟 Features

- **Time-Locked ETH**: Lock your ETH for a predetermined time period
- **Customizable Durations**: Choose how long to lock your funds
- **Early Withdrawal**: Option to withdraw early with a 5% penalty
- **User Dashboard**: Track all your locks and their status
- **Secure Implementation**: Built with security best practices
- **Modern UI**: Clean, responsive interface

## 📚 Project Structure

The project is divided into two main components:

- **`/blockchain`**: Smart contracts and deployment scripts
- **`/frontend`**: Next.js web application for interacting with the contracts

## 🔧 Technology Stack

### Smart Contract
- Solidity
- OpenZeppelin libraries
- ethers.js for deployment

### Frontend
- Next.js 14 (React)
- Tailwind CSS
- ethers.js v6
- shadcn/ui components

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MetaMask or other Ethereum wallet
- Sepolia testnet ETH for testing

### Contract Deployment

1. Navigate to the blockchain directory:
   ```
   cd blockchain
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your provider URL and private key.

4. Compile and deploy:
   ```
   npm run compile
   npm run deploy
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
   Configure as needed.

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## 💡 How It Works

1. **Connect Your Wallet**: Use the "Connect Wallet" button to connect your Ethereum wallet
2. **Create a Lock**: Specify the amount of ETH and lock duration
3. **Monitor Your Locks**: View all your active locks, status, and remaining time
4. **Withdraw Funds**: When a lock expires, withdraw your funds without penalty
5. **Early Withdrawal**: If needed, withdraw early with a 5% penalty

## 💼 Use Cases

- Personal savings with self-imposed restrictions
- Team funds with scheduled release dates
- Timed escrow for transactions
- Forced HODL strategy for crypto investments
- Recurring payments and allowances

## 🛠️ Advanced Setup

See the README.md files in the `/blockchain` and `/frontend` directories for more detailed setup instructions and configurations.

## 🧪 Testing

### Smart Contract Tests
```
cd blockchain
npm test
```

### Frontend Tests
```
cd frontend
npm test
```

## 🔐 Security

The smart contract implements several security measures:
- ReentrancyGuard protection
- Owner-only emergency functions
- Event emissions for transparency
- Clean, auditable code
