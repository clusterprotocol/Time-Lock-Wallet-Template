"use client"

import { useState } from "react"
import { Wallet, LogOut } from "lucide-react"
import WalletConnectModal from "./wallet-connect-modal"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"

export default function WalletConnectButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet()
  const { toast } = useToast()

  const handleConnect = async (provider: string) => {
    await connect()
    setIsModalOpen(false)
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      disconnect()
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected from this site",
      })
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {isConnected && (
        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="bg-primary text-white rounded-lg px-3 py-2 flex items-center space-x-1 hover:bg-opacity-80 transition-all duration-300 disabled:opacity-50"
          title="Disconnect wallet"
        >
          <LogOut size={16} />
        </button>
      )}
      <button
        onClick={() => isConnected ? null : setIsModalOpen(true)}
        disabled={isConnecting || isDisconnecting}
        className="bg-secondary text-background rounded-lg px-4 py-2 flex items-center space-x-2 hover:bg-gradient-to-r hover:from-accent-green hover:to-accent-blue transition-all duration-300 disabled:opacity-50"
      >
        <Wallet size={18} />
        <span>
          {isDisconnecting ? "Disconnecting..." : 
           isConnecting ? "Connecting..." : 
           isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 
           "Connect Wallet"}
        </span>
      </button>

      <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConnect={handleConnect} />
    </div>
  )
}
