"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, Plus, ChevronDown, ChevronUp } from "lucide-react"
import PageTransition from "@/components/page-transition"
import { useWallet } from "@/hooks/use-wallet"
import { ethers } from "ethers"
import { getContract } from "@/lib/web3"
import LoadingSpinner from "@/components/loading-spinner"

// Define types for lock data
interface Transaction {
  type: string;
  amount: string;
  date: Date;
}

interface Lock {
  id: string;
  amount: string;
  token: string;
  startDate: Date;
  endDate: Date;
  status: "Locked" | "Available";
  transactions: Transaction[];
}

export default function DashboardPage() {
  const [expandedLock, setExpandedLock] = useState<string | null>(null)
  const [locks, setLocks] = useState<Lock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { address, userLocks, refreshLocks } = useWallet()

  const toggleLockExpand = (lockId: string) => {
    if (expandedLock === lockId) {
      setExpandedLock(null)
    } else {
      setExpandedLock(lockId)
    }
  }

  // Load user's locks from the blockchain
  useEffect(() => {
    async function loadUserLocks() {
      if (!address) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        await refreshLocks()
        
        // Transform the userLocks from context into our component's format
        const formattedLocks: Lock[] = userLocks.map((lock, index) => {
          return {
            id: `lock-${index}`,
            amount: lock.amount,
            token: "ETH",
            startDate: new Date(lock.lockStart),
            endDate: new Date(lock.lockEnd),
            status: lock.isExpired && !lock.withdrawn ? "Available" : "Locked",
            transactions: [
              { type: "Deposit", amount: `${lock.amount} ETH`, date: new Date(lock.lockStart) }
            ]
          }
        })
        
        setLocks(formattedLocks)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading locks:", error)
        setIsLoading(false)
      }
    }

    loadUserLocks()
  }, [address, userLocks, refreshLocks])

  // Calculate total locked value
  const totalLocked = locks
    .filter((lock) => lock.status === "Locked")
    .reduce((sum, lock) => sum + Number.parseFloat(lock.amount), 0)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-text-secondary mb-8">Please connect your wallet to view your locked assets</p>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Locked Wealth</h1>
          <Link href="/deposit" className="btn-primary flex items-center">
            <Plus size={18} className="mr-2" /> New Deposit
          </Link>
        </div>

        {/* Stats Card */}
        <div className="card mb-8 bg-gradient-to-r from-primary/20 to-secondary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-text-secondary mb-1">Total Locked Value</p>
              <p className="text-3xl font-bold">{totalLocked.toFixed(2)} ETH</p>
            </div>
            <div className="text-center">
              <p className="text-text-secondary mb-1">Active Locks</p>
              <p className="text-3xl font-bold">{locks.filter((lock) => lock.status === "Locked").length}</p>
            </div>
            <div className="text-center">
              <p className="text-text-secondary mb-1">Available for Withdrawal</p>
              <p className="text-3xl font-bold">{locks.filter((lock) => lock.status === "Available").length}</p>
            </div>
          </div>
        </div>

        {/* Locks Grid */}
        {locks.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-xl font-bold mb-4">No Locks Found</h3>
            <p className="text-text-secondary mb-6">You don't have any locked assets yet.</p>
            <Link href="/deposit" className="btn-primary inline-flex items-center">
              <Plus size={18} className="mr-2" /> Create Your First Lock
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {locks.map((lock) => (
              <div
                key={lock.id}
                className={`card hover:shadow-lg transition-all duration-300 ${
                  lock.status === "Available" ? "border border-secondary/30" : ""
                }`}
              >
                <div
                  className="flex flex-col md:flex-row md:items-center justify-between cursor-pointer"
                  onClick={() => toggleLockExpand(lock.id)}
                >
                  <div className="flex items-center mb-4 md:mb-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        lock.status === "Locked" ? "bg-primary/20" : "bg-secondary/20"
                      }`}
                    >
                      <Clock size={24} className={lock.status === "Locked" ? "text-primary" : "text-secondary"} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {lock.amount} {lock.token}
                      </h3>
                      <p className="text-text-secondary text-sm">Locked on {lock.startDate.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
                    <div className="md:mr-8 text-right">
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          lock.status === "Locked" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                        }`}
                      >
                        {lock.status}
                      </div>
                      <p className="text-text-secondary text-sm mt-1">
                        {lock.status === "Locked"
                          ? `Unlocks on ${lock.endDate.toLocaleDateString()}`
                          : "Ready to withdraw"}
                      </p>
                    </div>

                    {expandedLock === lock.id ? (
                      <ChevronUp size={20} className="text-text-secondary" />
                    ) : (
                      <ChevronDown size={20} className="text-text-secondary" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedLock === lock.id && (
                  <div className="mt-6 pt-6 border-t border-gray-800 animate-in fade-in duration-300">
                    <h4 className="font-medium mb-3">Transaction History</h4>
                    <div className="space-y-3">
                      {lock.transactions.map((tx, index) => (
                        <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-background">
                          <div>
                            <p className="font-medium">{tx.type}</p>
                            <p className="text-text-secondary text-sm">{tx.date.toLocaleDateString()}</p>
                          </div>
                          <p>{tx.amount}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                      {lock.status === "Available" ? (
                        <Link href={`/withdraw?id=${lock.id}`} className="btn-primary">
                          Withdraw Funds
                        </Link>
                      ) : (
                        <div className="flex items-center text-text-secondary">
                          <Clock size={16} className="mr-2" />
                          <span>
                            {Math.ceil((lock.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
