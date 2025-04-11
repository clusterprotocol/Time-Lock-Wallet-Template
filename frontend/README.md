# TimeLockWallet Frontend

A modern, responsive web application for interacting with the TimeLockWallet smart contract.

## Features

- Connect to Ethereum wallets (MetaMask, WalletConnect, etc.)
- View account balance and wallet status
- Create time-locked deposits with custom durations
- View all your locked deposits and their status
- Withdraw funds when locks expire
- Early withdrawal option with penalty fee
- Mobile-friendly responsive design

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Blockchain Integration**: ethers.js v6
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Directory Structure

- `app/` - Next.js application routes and pages
- `components/` - Reusable UI components
- `contracts/` - Contract ABIs and addresses
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and blockchain interactions
- `public/` - Static assets
- `styles/` - Global CSS and theme configuration

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MetaMask or similar Ethereum wallet extension

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env.local` file based on `.env.example`:
   ```
   cp .env.example .env.local
   ```

3. Configure your environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_NETWORK=sepolia
   NEXT_PUBLIC_RPC_SEPOLIA=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   ```

### Run Development Server

```
npm run dev
```

This starts the development server at `http://localhost:3000`.

## Key Components

### Wallet Connection
The application uses a custom wallet hook (`use-wallet.tsx`) to manage wallet connections, handle reconnections, and track users' locks.

### Contract Integration
The `web3.ts` file in the `lib` directory handles all interactions with the smart contract, including depositing ETH, withdrawing funds, and fetching user locks.

### UI Components
- `wallet-connect-button.tsx` - Button for connecting/disconnecting wallets
- `dashboard.tsx` - Main user interface for interacting with time locks
- `create-lock-form.tsx` - Form for creating new time-locked deposits
- `lock-card.tsx` - Card displaying a single time-locked deposit
