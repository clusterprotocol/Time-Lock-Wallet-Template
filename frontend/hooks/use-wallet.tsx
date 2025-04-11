"use client"

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { connectWallet, getUserLocks, clearCache } from '@/lib/web3';
import { useToast } from './use-toast';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  userLocks: any[];
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshLocks: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  userLocks: [],
  connect: async () => {},
  disconnect: () => {},
  refreshLocks: async () => {},
});

// Key used to store wallet connection status in localStorage
const WALLET_CONNECTED_KEY = 'walletConnected';
// Key used to track if user has explicitly disconnected
const WALLET_DISCONNECTED_KEY = 'walletDisconnected';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userLocks, setUserLocks] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Refs to track connection state
  const connectionAttemptedRef = useRef(false);
  const refreshingLocksRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializingRef = useRef(false);
  const mountedRef = useRef(false);
  
  // Track number of reconnection attempts to prevent infinite loops
  const reconnectionAttemptsRef = useRef(0);
  const MAX_RECONNECTION_ATTEMPTS = 2;

  const connect = async () => {
    // Prevent multiple connection attempts
    if (isConnecting || connectionAttemptedRef.current) return;
    
    try {
      setIsConnecting(true);
      connectionAttemptedRef.current = true;
      
      // Clear cache to ensure fresh data
      clearCache('provider_signer');
      
      // Clear the explicit disconnect flag
      localStorage.removeItem(WALLET_DISCONNECTED_KEY);
      
      const { success, address, error } = await connectWallet();
      
      if (success && address) {
        setAddress(address);
        localStorage.setItem(WALLET_CONNECTED_KEY, 'true');
        reconnectionAttemptsRef.current = 0; // Reset reconnection attempts on successful connect
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
        
        // Slight delay before fetching locks to ensure wallet is fully connected
        setTimeout(() => {
          if (mountedRef.current) {
            refreshLocks().catch(err => {
              console.warn("Initial locks refresh failed:", err);
            });
          }
        }, 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: error || "Failed to connect wallet",
        });
        localStorage.removeItem(WALLET_CONNECTED_KEY);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      localStorage.removeItem(WALLET_CONNECTED_KEY);
      
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      if (mountedRef.current) {
        setIsConnecting(false);
      }
      
      // Reset connection attempt flag after a delay to prevent rapid repeated attempts
      setTimeout(() => {
        connectionAttemptedRef.current = false;
      }, 2000);
    }
  };

  const disconnect = useCallback(() => {
    setAddress(null);
    setUserLocks([]);
    
    // Remove the connected flag and set the disconnected flag
    localStorage.removeItem(WALLET_CONNECTED_KEY);
    localStorage.setItem(WALLET_DISCONNECTED_KEY, 'true');
    
    // Clear any pending reconnect attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Reset reconnection tracking
    reconnectionAttemptsRef.current = 0;
    
    // Clear web3 cache
    clearCache();
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  }, [toast]);

  const refreshLocks = async () => {
    if (!address || refreshingLocksRef.current) return;
    
    refreshingLocksRef.current = true;
    try {
      const locks = await getUserLocks(address);
      if (mountedRef.current) { // Only update state if component is still mounted
        setUserLocks(locks);
      }
    } catch (error) {
      console.error('Error fetching locks:', error);
      // Don't show toast for fetch errors to avoid spamming the user
    } finally {
      refreshingLocksRef.current = false;
    }
  };

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    // Check if user has explicitly disconnected
    const hasDisconnected = localStorage.getItem(WALLET_DISCONNECTED_KEY) === 'true';
    
    if (accounts.length > 0 && !hasDisconnected) {
      setAddress(accounts[0]);
      localStorage.setItem(WALLET_CONNECTED_KEY, 'true');
      
      // Slight delay before refreshing locks
      setTimeout(() => {
        if (mountedRef.current) {
          refreshLocks().catch(err => console.warn("Error refreshing locks after account change:", err));
        }
      }, 500);
    } else {
      // User disconnected their wallet or we're respecting a previous disconnect
      disconnect();
    }
  }, [disconnect]);

  // Handle chain changes
  const handleChainChanged = useCallback(() => {
    // Reload the page when chain changes
    window.location.reload();
  }, []);

  // Initialize the wallet connection
  const initWallet = useCallback(async () => {
    if (initializingRef.current || !mountedRef.current) return;
    
    initializingRef.current = true;
    
    try {
      // Check if user has explicitly disconnected
      const hasDisconnected = localStorage.getItem(WALLET_DISCONNECTED_KEY) === 'true';
      
      // If user has explicitly disconnected, don't auto-reconnect
      if (hasDisconnected) {
        console.log("User previously disconnected - not auto-reconnecting");
        return;
      }
      
      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && window.ethereum) {
        // Check if we're already connected (MetaMask remembers connections)
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          // Only auto-connect if user has not explicitly disconnected
          if (!hasDisconnected) {
            // We're already connected, set the address
            setAddress(accounts[0]);
            localStorage.setItem(WALLET_CONNECTED_KEY, 'true');
            
            // Fetch locks after a short delay
            setTimeout(() => {
              if (mountedRef.current) {
                refreshLocks().catch(err => console.warn("Initial locks refresh failed:", err));
              }
            }, 1000);
          }
        } else {
          // Not connected, check if we should reconnect
          const wasConnected = localStorage.getItem(WALLET_CONNECTED_KEY);
          
          // Only attempt reconnection if not explicitly disconnected
          if (wasConnected === 'true' && !hasDisconnected && reconnectionAttemptsRef.current < MAX_RECONNECTION_ATTEMPTS) {
            reconnectionAttemptsRef.current++;
            
            // Slight delay before attempting to connect
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current && !address) {
                connect().catch(console.error);
              }
              reconnectTimeoutRef.current = null;
            }, 1500);
          }
        }
        
        // Set up event listeners for wallet changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }
    } catch (error) {
      console.error("Error initializing wallet:", error);
      localStorage.removeItem(WALLET_CONNECTED_KEY);
    } finally {
      initializingRef.current = false;
    }
  }, [address, handleAccountsChanged, handleChainChanged, connect]);

  // Effect to initialize wallet connection and setup listeners
  useEffect(() => {
    mountedRef.current = true;
    
    // Call initWallet with a slight delay to avoid blocking render
    const initialTimer = setTimeout(() => {
      initWallet();
    }, 500);
    
    return () => {
      // Clean up on unmount
      mountedRef.current = false;
      
      // Clear all timeouts
      clearTimeout(initialTimer);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Remove event listeners
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [initWallet, handleAccountsChanged, handleChainChanged]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        userLocks,
        connect,
        disconnect,
        refreshLocks,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext); 