"use client"
import WalletConnectButton from "./wallet-connect-button"

export default function Header() {
  return (
    <header className="h-16 border-b border-gray-800 flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex justify-end">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  )
}
