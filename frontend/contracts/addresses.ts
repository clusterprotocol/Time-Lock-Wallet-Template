export enum Network {
  LOCALHOST = 'localhost',
  SEPOLIA = 'sepolia',
  MAINNET = 'mainnet'
}

export interface ContractNetworkInfo {
  address: string;
  blockExplorer: string;
}

export interface ContractInfo {
  name: string;
  description: string;
  networks: {
    [key in Network]?: ContractNetworkInfo;
  };
}

export const TimeLockedWalletInfo: ContractInfo = {
  name: "TimeLockedWallet",
  description: "Smart contract that allows users to lock ETH for a specified period with an optional early withdrawal penalty",
  networks: {
    [Network.SEPOLIA]: {
      address: "0x672861D61A5907327cB9B31b706A8c78743d7Be6",
      blockExplorer: "https://sepolia.etherscan.io"
    },
    [Network.MAINNET]: {
      address: "",
      blockExplorer: "https://etherscan.io"
    },
    [Network.LOCALHOST]: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      blockExplorer: ""
    }
  }
};

// Get the current network from environment or default to sepolia
export const getCurrentNetwork = (): Network => {
  // In browser environment, check for env variable
  if (typeof window !== 'undefined') {
    const envNetwork = process.env.NEXT_PUBLIC_NETWORK;
    if (envNetwork) {
      if (Object.values(Network).includes(envNetwork as Network)) {
        return envNetwork as Network;
      }
    }
  }
  return Network.SEPOLIA; // Default network
}; 