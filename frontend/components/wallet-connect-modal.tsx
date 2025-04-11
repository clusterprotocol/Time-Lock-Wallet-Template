"use client"

import { X } from "lucide-react"

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (provider: string) => void
}

export default function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  if (!isOpen) return null

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Connect to your MetaMask Wallet",
      color: "#F6851B",
      icon: (
        <svg viewBox="0 0 35 33" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32.9582 1L19.8241 10.7183L22.2103 5.09108L32.9582 1Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2.04184 1L15.0552 10.8233L12.7899 5.09108L2.04184 1Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M28.1861 23.6283L24.6567 29.0314L32.3063 31.1141L34.5172 23.7508L28.1861 23.6283Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M0.500366 23.7508L2.6938 31.1141L10.3434 29.0314L6.81396 23.6283L0.500366 23.7508Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.91244 14.5149L7.8822 17.7049L15.4642 18.0449L15.2061 9.86865L9.91244 14.5149Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M25.0874 14.5149L19.7077 9.76367L19.8241 18.0449L27.4178 17.7049L25.0874 14.5149Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.3433 29.0313L15.0391 26.8423L11.0311 23.8037L10.3433 29.0313Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.9606 26.8423L24.6564 29.0313L23.9686 23.8037L19.9606 26.8423Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Scan with WalletConnect to connect",
      color: "#3B99FC",
      icon: (
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.58818 11.8556C13.1293 8.31442 18.8706 8.31442 22.4117 11.8556L22.8379 12.2818C23.015 12.4589 23.015 12.7459 22.8379 12.9231L21.3801 14.3809C21.2915 14.4695 21.148 14.4695 21.0594 14.3809L20.473 13.7945C18.041 11.3625 13.9589 11.3625 11.5269 13.7945L10.8989 14.4225C10.8103 14.5111 10.6668 14.5111 10.5782 14.4225L9.12041 12.9647C8.94326 12.7875 8.94326 12.5006 9.12041 12.3234L9.58818 11.8556ZM25.4268 14.8706L26.7243 16.1682C26.9015 16.3453 26.9015 16.6323 26.7243 16.8094L20.8985 22.6352C20.7214 22.8124 20.4344 22.8124 20.2573 22.6352C20.2573 22.6352 20.2573 22.6352 20.2573 22.6352L16.2138 18.5917C16.1695 18.5475 16.0971 18.5475 16.0528 18.5917C16.0528 18.5917 16.0528 18.5917 16.0528 18.5917L12.0094 22.6352C11.8322 22.8124 11.5453 22.8124 11.3681 22.6352C11.3681 22.6352 11.3681 22.6352 11.3681 22.6352L5.5423 16.8094C5.36516 16.6323 5.36516 16.3453 5.5423 16.1682L6.83978 14.8706C7.01693 14.6935 7.30391 14.6935 7.48105 14.8706L11.5245 18.9141C11.5688 18.9584 11.6411 18.9584 11.6854 18.9141C11.6854 18.9141 11.6854 18.9141 11.6854 18.9141L15.7289 14.8706C15.906 14.6935 16.193 14.6935 16.3701 14.8706C16.3701 14.8706 16.3701 14.8706 16.3701 14.8706L20.4136 18.9141C20.4579 18.9584 20.5302 18.9584 20.5745 18.9141L24.6179 14.8706C24.7951 14.6935 25.0821 14.6935 25.2592 14.8706L25.4268 14.8706Z" fill="#3B99FC"/>
        </svg>
      ),
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      description: "Connect to your Coinbase Wallet",
      color: "#0052FF",
      icon: (
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#0052FF"/>
          <path d="M16.0006 6.75C20.9956 6.75 25.0381 10.793 25.0381 15.7881C25.0381 20.7831 20.9956 24.8256 16.0006 24.8256C11.0056 24.8256 6.96313 20.7831 6.96313 15.7881C6.96313 10.793 11.0056 6.75 16.0006 6.75ZM13.7956 13.5756C13.3856 13.5756 13.0531 13.9081 13.0531 14.3181V17.2581C13.0531 17.6681 13.3856 18.0006 13.7956 18.0006H18.2056C18.6156 18.0006 18.9481 17.6681 18.9481 17.2581V14.3181C18.9481 13.9081 18.6156 13.5756 18.2056 13.5756H13.7956Z" fill="white"/>
        </svg>
      ),
    },
    {
      id: "trust",
      name: "Trust Wallet",
      description: "Connect to your Trust Wallet",
      color: "#3375BB",
      icon: (
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C24.8375 0 32 7.1625 32 16C32 24.8375 24.8375 32 16 32C7.1625 32 0 24.8375 0 16C0 7.1625 7.1625 0 16 0Z" fill="#3375BB"/>
          <path d="M16.0016 6.4C19.0477 8.9818 23.0937 8.9891 24.2938 8.9891C24.0938 23.6 21.7313 20.5673 16.0016 24.8C10.2719 20.5673 7.9094 23.6 7.7094 8.9891C8.9094 8.9891 12.9555 8.9818 16.0016 6.4Z" stroke="white" strokeWidth="1.56522" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="glass-card rounded-xl w-full max-w-md p-6 animate-in fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Connect Wallet</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors duration-300">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => onConnect(wallet.id)}
              className="flex items-center p-4 rounded-lg border border-gray-800 hover:border-secondary hover:bg-black/20 transition-all duration-300"
            >
              <div className="flex-shrink-0 mr-4" style={{ color: wallet.color }}>
                {wallet.icon}
              </div>
              <div className="text-left">
                <span className="font-medium block">{wallet.name}</span>
                <span className="text-sm text-text-secondary">{wallet.description}</span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-text-secondary text-center">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
