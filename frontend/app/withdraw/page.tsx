"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowRight, AlertTriangle, Lock, Unlock } from "lucide-react"
import LoadingSpinner from "@/components/loading-spinner"
import PageTransition from "@/components/page-transition"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { withdraw } from "@/lib/web3"

export default function WithdrawPage() {
  const { address, isConnected, connect, userLocks, refreshLocks } = useWallet()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedLockId, setSelectedLockId] = useState<string>("")
  const [earlyWithdrawal, setEarlyWithdrawal] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [txUrl, setTxUrl] = useState("")

  // Load initial lock ID from URL if available
  useEffect(() => {
    const lockIdParam = searchParams.get("id")
    if (lockIdParam && !isNaN(parseInt(lockIdParam))) {
      setSelectedLockId(lockIdParam)
    }
  }, [searchParams])

  // Refresh locks when component mounts
  useEffect(() => {
    if (isConnected) {
      refreshLocks()
    }
  }, [isConnected, refreshLocks])

  const selectedLock = userLocks.find((lock) => lock.id.toString() === selectedLockId)
  const isLocked = selectedLock ? !selectedLock.isExpired : false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      await connect()
      return
    }
    
    if (!selectedLock) {
      toast({
        variant: "destructive",
        title: "No Lock Selected",
        description: "Please select a lock to withdraw from.",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const result = await withdraw(parseInt(selectedLockId), earlyWithdrawal)
      
      if (result.success) {
        setTxHash(result.receipt.transactionHash)
        setTxUrl(result.transactionUrl || "")
        setShowConfirmation(true)
        refreshLocks() // Refresh locks after successful withdrawal
        toast({
          title: "Withdrawal Successful",
          description: `Successfully withdrawn your locked ETH.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Withdrawal Failed",
          description: result.error || "Transaction failed. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error during withdrawal:", error)
      toast({
        variant: "destructive",
        title: "Transaction Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedLockId("")
    setEarlyWithdrawal(false)
    setShowConfirmation(false)
    setTxHash("")
    setTxUrl("")
  }

  // Calculate penalty amount (5% of locked amount)
  const penaltyAmount = selectedLock ? Number.parseFloat(selectedLock.amount) * 0.05 : 0
  const withdrawalAmount = selectedLock
    ? earlyWithdrawal
      ? Number.parseFloat(selectedLock.amount) - penaltyAmount
      : Number.parseFloat(selectedLock.amount)
    : 0

  // Check if the user has any available locks
  const hasAvailableLocks = userLocks.some(lock => !lock.withdrawn);

  if (isConnected && userLocks.length === 0) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Unlock Your Funds</h1>
            <div className="w-20 h-1 bg-primary mb-8"></div>
            
            <div className="card text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Lock size={32} className="text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4">No Locked Funds</h3>
              <p className="text-text-secondary mb-6">
                You don't have any locked funds yet. Deposit ETH to start earning.
              </p>
              
              <button 
                onClick={() => router.push('/deposit')} 
                className="btn-primary"
              >
                Deposit Funds <ArrowRight size={18} className="ml-2 inline" />
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Unlock Your Funds</h1>
          <div className="w-20 h-1 bg-primary mb-8"></div>

          {!isConnected ? (
            <div className="card text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary/20 flex items-center justify-center">
                <Lock size={32} className="text-secondary" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4">Connect Your Wallet</h3>
              <p className="text-text-secondary mb-6">
                Connect your wallet to view and withdraw your locked funds.
              </p>
              
              <button 
                onClick={connect} 
                className="btn-primary"
              >
                Connect Wallet <ArrowRight size={18} className="ml-2 inline" />
              </button>
            </div>
          ) : (
            <div className="card">
              {!showConfirmation ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor="lockId" className="block text-sm font-medium mb-2">
                      Select Lock
                    </label>
                    <select
                      id="lockId"
                      value={selectedLockId}
                      onChange={(e) => {
                        setSelectedLockId(e.target.value)
                        setEarlyWithdrawal(false)
                      }}
                      className="input-primary w-full"
                      required
                    >
                      <option value="">Select a lock</option>
                      {userLocks.map((lock) => (
                        <option 
                          key={lock.id} 
                          value={lock.id.toString()}
                          disabled={lock.withdrawn}
                        >
                          {lock.amount} ETH - {lock.isExpired ? "Available" : "Locked"} {lock.withdrawn ? " (Withdrawn)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedLock && !selectedLock.withdrawn && (
                    <>
                      <div className="mb-6 p-4 rounded-lg bg-background border border-gray-800">
                        <div className="flex justify-between mb-2">
                          <span className="text-text-secondary">Amount:</span>
                          <span className="font-medium">
                            {selectedLock.amount} ETH
                          </span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-text-secondary">Lock Date:</span>
                          <span>{selectedLock.lockStart.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-text-secondary">Unlock Date:</span>
                          <span>{selectedLock.lockEnd.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Status:</span>
                          <span className={`${isLocked ? "text-primary" : "text-secondary"}`}>
                            {isLocked ? "Locked" : "Available"}
                          </span>
                        </div>
                      </div>

                      {isLocked && (
                        <div className="mb-6">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={earlyWithdrawal}
                              onChange={(e) => setEarlyWithdrawal(e.target.checked)}
                              className="mr-2 h-4 w-4 rounded border-gray-700 text-secondary focus:ring-secondary"
                            />
                            <span>I want to withdraw early (5% penalty)</span>
                          </label>

                          {earlyWithdrawal && (
                            <div className="mt-4 p-4 rounded-lg bg-accent-red/10 border border-accent-red/30 flex items-start">
                              <AlertTriangle size={20} className="text-accent-red mr-3 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-accent-red mb-1">Early Withdrawal Penalty</p>
                                <p className="text-sm text-text-secondary">
                                  You will be charged a 5% penalty ({penaltyAmount.toFixed(4)} ETH) for
                                  withdrawing before the lock period ends.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center">
                      {selectedLock && !selectedLock.withdrawn &&
                        (isLocked ? (
                          <Lock size={20} className="text-primary mr-2" />
                        ) : (
                          <Unlock size={20} className="text-secondary mr-2" />
                        ))}
                      <span className="text-text-secondary">
                        {selectedLock && !selectedLock.withdrawn
                          ? isLocked && !earlyWithdrawal
                            ? `Locked until: ${selectedLock.lockEnd.toLocaleDateString()}`
                            : `You will receive: ${withdrawalAmount.toFixed(4)} ETH`
                          : hasAvailableLocks ? "Select a lock to withdraw" : "No available locks"}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedLockId || (isLocked && !earlyWithdrawal) || isSubmitting || (selectedLock?.withdrawn ?? false)}
                      className={`btn-primary w-full md:w-auto flex items-center justify-center ${
                        !selectedLockId || (isLocked && !earlyWithdrawal) || isSubmitting || (selectedLock?.withdrawn ?? false)
                          ? "opacity-70 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          Withdraw Funds <ArrowRight size={18} className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-secondary"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">Withdrawal Successful!</h3>
                  <p className="text-text-secondary mb-2">
                    You have successfully withdrawn {withdrawalAmount.toFixed(4)} ETH.
                    {earlyWithdrawal && (
                      <span className="block mt-2">
                        A penalty of {penaltyAmount.toFixed(4)} ETH was applied.
                      </span>
                    )}
                  </p>

                  {txUrl && (
                    <a 
                      href={txUrl}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-secondary hover:text-accent-blue text-sm block mb-6"
                    >
                      View transaction on block explorer
                    </a>
                  )}

                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button onClick={resetForm} className="btn-secondary">
                      Make Another Withdrawal
                    </button>
                    <button 
                      onClick={() => router.push('/dashboard')} 
                      className="btn-primary"
                    >
                      View Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
