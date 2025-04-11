import { ethers } from "ethers";
import { TimeLockedWallet, getTransactionUrl, isContractDeployed } from "@/contracts";

// Cache system to reduce redundant RPC calls
interface CacheEntry {
  value: any;
  timestamp: number;
}

interface CacheStore {
  [key: string]: CacheEntry;
}

const cache: CacheStore = {};
const CACHE_DURATION = {
  USER_LOCKS: 10000, // 10 seconds
  CONTRACT_CALL: 5000, // 5 seconds
  WALLET_CONNECTION: 30000 // 30 seconds
};

// Helper function to safely execute contract calls with error handling
const safeContractCall = async <T,>(
  contractMethod: () => Promise<T>,
  fallbackValue: T,
  errorMessage = "Contract call failed",
  cacheKey?: string,
  cacheDuration = CACHE_DURATION.CONTRACT_CALL
): Promise<T> => {
  // Try to return from cache first if a cacheKey is provided
  if (cacheKey && cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < cacheDuration) {
    return cache[cacheKey].value;
  }

  try {
    const result = await contractMethod();
    
    // Cache the result if a cacheKey was provided
    if (cacheKey) {
      cache[cacheKey] = {
        value: result,
        timestamp: Date.now()
      };
    }
    
    return result;
  } catch (error: any) {
    console.warn(`${errorMessage}:`, error?.message || error);
    return fallbackValue;
  }
};

// Custom provider class to avoid ENS lookups which can cause loops
class NoENSProvider extends ethers.BrowserProvider {
  // Override any ENS-related methods to return immediate values
  async resolveName(name: string): Promise<string> {
    return name; // Just return the name as is without resolution
  }
  
  async lookupAddress(address: string): Promise<string | null> {
    return null; // Don't do reverse lookup
  }
}

// Helper to get provider and signer
export const getProviderAndSigner = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  // Use cached provider if available to reduce RPC calls
  const cacheKey = 'provider_signer';
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION.WALLET_CONNECTION) {
    return cache[cacheKey].value;
  }

  try {
    // Only request accounts if not already cached
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Use custom NoENSProvider to avoid ENS lookups
    const provider = new NoENSProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Check that we're on the right network
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    // Log chain information for debugging
    console.log(`Connected to chain ID: ${chainId}`);
    
    // Check if we're on the Sepolia testnet (chainId 11155111) for deployment
    if (TimeLockedWallet.network === 'sepolia' && chainId !== 11155111) {
      console.warn('Not connected to Sepolia testnet - contract interactions may fail');
    }
    
    const result = { provider, signer, chainId };
    
    // Cache the result
    cache[cacheKey] = {
      value: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error("Error in getProviderAndSigner:", error);
    throw error;
  }
};

// Connect to wallet
export const connectWallet = async () => {
  try {
    // Reset cache to ensure fresh data on explicit connect action
    delete cache['provider_signer'];
    
    const { signer, chainId } = await getProviderAndSigner();
    const address = await signer.getAddress();
    
    // Check if contract is deployed
    if (!isContractDeployed()) {
      console.warn("Contract is not deployed on the current network");
    }
    
    return { success: true, address, chainId };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Get contract instance with caching to reduce RPC calls
export const getContract = async (withSigner = true) => {
  try {
    const { provider, signer } = await getProviderAndSigner();
    
    if (!isContractDeployed()) {
      throw new Error(`Contract not deployed on this network. Please switch to ${TimeLockedWallet.network} network.`);
    }
    
    return new ethers.Contract(
      TimeLockedWallet.address,
      TimeLockedWallet.abi,
      withSigner ? signer : provider
    );
  } catch (error) {
    console.error("Error getting contract:", error);
    throw error;
  }
};

// Deposit ETH with a lock period
export const deposit = async (amount: string, lockPeriodDays: number) => {
  try {
    if (!isContractDeployed()) {
      return { 
        success: false, 
        error: `Contract not deployed on this network. Please switch to ${TimeLockedWallet.network} network.` 
      };
    }
    
    const contract = await getContract();
    const lockPeriodSeconds = lockPeriodDays * 24 * 60 * 60; // Convert days to seconds
    const tx = await contract.deposit(lockPeriodSeconds, {
      value: ethers.parseEther(amount)
    });
    const receipt = await tx.wait();
    
    // Clear user locks cache after a successful deposit
    Object.keys(cache).forEach(key => {
      if (key.startsWith('user_locks_')) {
        delete cache[key];
      }
    });
    
    return { 
      success: true, 
      receipt,
      transactionUrl: getTransactionUrl(receipt.hash)
    };
  } catch (error) {
    console.error("Error depositing:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Withdraw locked funds
export const withdraw = async (lockId: number, allowEarly: boolean) => {
  try {
    if (!isContractDeployed()) {
      return { 
        success: false, 
        error: `Contract not deployed on this network. Please switch to ${TimeLockedWallet.network} network.` 
      };
    }
    
    const contract = await getContract();
    const tx = await contract.withdraw(lockId, allowEarly);
    const receipt = await tx.wait();
    
    // Clear user locks cache after a successful withdrawal
    Object.keys(cache).forEach(key => {
      if (key.startsWith('user_locks_')) {
        delete cache[key];
      }
    });
    
    return { 
      success: true, 
      receipt,
      transactionUrl: getTransactionUrl(receipt.hash)
    };
  } catch (error) {
    console.error("Error withdrawing:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Get all locks for a user with caching
export const getUserLocks = async (address: string) => {
  // First check if contract is deployed
  if (!isContractDeployed()) {
    console.warn(`Contract not deployed on this network. Please switch to ${TimeLockedWallet.network} network.`);
    return [];
  }
  
  // First check if address is valid to avoid unnecessary contract calls
  if (!address || !ethers.isAddress(address)) {
    console.warn("Invalid address provided to getUserLocks");
    return [];
  }

  // Use caching to reduce RPC calls
  const cacheKey = `user_locks_${address.toLowerCase()}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION.USER_LOCKS) {
    return cache[cacheKey].value;
  }

  // Check if we can get a contract instance
  let contract;
  try {
    contract = await getContract(false); // Read-only, no need for signer
  } catch (error) {
    console.warn("Could not get contract for getUserLocks:", error);
    return [];
  }
  
  // Try to get locks using safe contract call which handles errors gracefully
  return safeContractCall(
    async () => {
      // Try to call getUserLockCount first to check if contract is working
      try {
        const count = await contract.getUserLockCount(address);
        console.log(`User has ${count} locks`);
        
        // If count is 0, return empty array early
        if (count === 0 || count === BigInt(0)) {
          return [];
        }
      } catch (countError) {
        console.warn("Error getting lock count, proceeding with locks retrieval:", countError);
        // Continue with getUserLocks attempt
      }
      
      const locks = await contract.getUserLocks(address);
      
      // Handle empty results
      if (!locks || locks.length === 0) {
        return [];
      }
      
      // Transform the returned data to a more usable format
      return locks.map((lock: any, index: number) => ({
        id: index,
        amount: ethers.formatEther(lock.amount),
        lockPeriod: Number(lock.lockPeriod),
        lockStart: new Date(Number(lock.lockStart) * 1000),
        lockEnd: new Date(Number(lock.lockEnd) * 1000),
        withdrawn: lock.withdrawn,
        isExpired: Date.now() > Number(lock.lockEnd) * 1000,
        remaining: Math.max(0, Number(lock.lockEnd) - Math.floor(Date.now() / 1000))
      }));
    },
    [], // Fallback to empty array
    "Failed to fetch user locks",
    cacheKey,
    CACHE_DURATION.USER_LOCKS
  );
};

// Clear cache by pattern
export const clearCache = (pattern?: string) => {
  if (pattern) {
    Object.keys(cache).forEach(key => {
      if (key.includes(pattern)) {
        delete cache[key];
      }
    });
  } else {
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
  }
};

// Listen for contract events
export const listenForEvents = (
  callback: {
    onDeposit?: (event: any) => void;
    onWithdrawal?: (event: any) => void;
    onPenalty?: (event: any) => void;
  }
) => {
  const setupListeners = async () => {
    try {
      // Check if contract is deployed
      if (!isContractDeployed()) {
        console.warn(`Contract not deployed on this network. Please switch to ${TimeLockedWallet.network} network.`);
        return () => {}; // Return empty cleanup function
      }
      
      const contract = await getContract(false);
      
      if (callback.onDeposit) {
        contract.on("Deposit", (user, amount, lockPeriod, lockId, event) => {
          // Clear cache on events
          clearCache('user_locks_');
          
          callback.onDeposit?.({
            user,
            amount: ethers.formatEther(amount),
            lockPeriod: Number(lockPeriod),
            lockId: Number(lockId),
            event
          });
        });
      }
      
      if (callback.onWithdrawal) {
        contract.on("Withdrawal", (user, amount, lockId, isEarly, event) => {
          // Clear cache on events
          clearCache('user_locks_');
          
          callback.onWithdrawal?.({
            user,
            amount: ethers.formatEther(amount),
            lockId: Number(lockId),
            isEarly,
            event
          });
        });
      }
      
      if (callback.onPenalty) {
        contract.on("PenaltyApplied", (user, penaltyAmount, event) => {
          callback.onPenalty?.({
            user,
            penaltyAmount: ethers.formatEther(penaltyAmount),
            event
          });
        });
      }
      
      return () => {
        contract.removeAllListeners();
      };
    } catch (error) {
      console.error("Error setting up event listeners:", error);
      return () => {}; // Return empty cleanup function
    }
  };
  
  return setupListeners();
};

// Add ethers.js types for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
} 