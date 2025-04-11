import { TimeLockedWalletABI } from './abi';
import { TimeLockedWalletInfo, Network, getCurrentNetwork } from './addresses';

// Type definitions for our contract data
interface ContractNetworkInfo {
  address: string;
  blockExplorer: string;
}

interface ContractData {
  name: string;
  description: string;
  networks: {
    [key: string]: ContractNetworkInfo;
  };
  abi: any[];
}

// Helper to get contract data for the current network
export const getContractData = (
  contractInfo: typeof TimeLockedWalletInfo, 
  abi: any[] = TimeLockedWalletABI,
  network: Network = getCurrentNetwork()
): {
  address: string;
  abi: any[];
  blockExplorer: string;
  name: string;
  isDeployed: boolean;
  network: Network;
} => {
  const networkData = contractInfo.networks[network];
  
  // Check if the contract is deployed on the current network
  const isDeployed = !!(networkData?.address && 
    networkData.address !== '0x0000000000000000000000000000000000000000' && 
    networkData.address !== '');
    
  // Log network and contract info for debugging
  console.log(`Network: ${network}, Contract address: ${networkData?.address || 'Not deployed'}`);
  
  return {
    address: networkData?.address || '',
    abi: abi,
    blockExplorer: networkData?.blockExplorer || '',
    name: contractInfo.name,
    isDeployed,
    network
  };
};

// Export TimeLockedWallet contract data
export const TimeLockedWallet = getContractData(TimeLockedWalletInfo, TimeLockedWalletABI);

// Helper function to get transaction URL
export const getTransactionUrl = (txHash: string, network: Network = getCurrentNetwork()): string => {
  const blockExplorer = TimeLockedWalletInfo.networks[network]?.blockExplorer;
  if (!blockExplorer) return '';
  return `${blockExplorer}/tx/${txHash}`;
};

// Helper function to get address URL
export const getAddressUrl = (address: string, network: Network = getCurrentNetwork()): string => {
  const blockExplorer = TimeLockedWalletInfo.networks[network]?.blockExplorer;
  if (!blockExplorer) return '';
  return `${blockExplorer}/address/${address}`;
};

// Helper to check if the contract is deployed on the current network
export const isContractDeployed = (): boolean => {
  return TimeLockedWallet.isDeployed;
};

// Re-export Network enum
export { Network, getCurrentNetwork };

// Export all contracts
const contracts = {
  TimeLockedWallet
};

export default contracts; 