"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, Clock, Info } from "lucide-react"
import LoadingSpinner from "@/components/loading-spinner"
import PageTransition from "@/components/page-transition"
import { deposit } from "@/lib/web3"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function DepositPage() {
  const { address, isConnected, connect } = useWallet()
  const { toast } = useToast()
  const router = useRouter()
  
  const [amount, setAmount] = useState("")
  const [lockPeriod, setLockPeriod] = useState("30")
  const [customPeriod, setCustomPeriod] = useState("")
  const [isCustomPeriod, setIsCustomPeriod] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [txUrl, setTxUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      await connect()
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const effectiveLockPeriod = isCustomPeriod 
        ? parseInt(customPeriod) 
        : parseInt(lockPeriod)
      
      const result = await deposit(amount, effectiveLockPeriod)
      
      if (result.success) {
        setTxHash(result.receipt.transactionHash)
        setTxUrl(result.transactionUrl || "")
        setShowConfirmation(true)
        toast({
          title: "Deposit Successful",
          description: `Successfully locked ${amount} ETH for ${effectiveLockPeriod} days.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Deposit Failed",
          description: result.error || "Transaction failed. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error during deposit:", error)
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
    setAmount("")
    setLockPeriod("30")
    setCustomPeriod("")
    setIsCustomPeriod(false)
    setShowConfirmation(false)
    setTxHash("")
    setTxUrl("")
  }

  const effectiveLockPeriod = isCustomPeriod ? customPeriod : lockPeriod

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Lock Your Funds</h1>
          <div className="w-20 h-1 bg-primary mb-8"></div>

          <div className="card">
            {!showConfirmation ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="amount" className="block text-sm font-medium mb-2">
                    Deposit Amount (ETH)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-primary w-full"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Lock Period</label>

                  {!isCustomPeriod ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {["30", "90", "180", "365"].map((days) => (
                        <button
                          key={days}
                          type="button"
                          className={`py-2 px-4 rounded-lg border transition-all duration-300 ${
                            lockPeriod === days
                              ? "border-secondary bg-secondary/10 text-white"
                              : "border-gray-700 text-text-secondary hover:border-secondary"
                          }`}
                          onClick={() => {
                            setLockPeriod(days)
                            setIsCustomPeriod(false)
                          }}
                        >
                          {days} Days
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-3">
                      <input
                        type="number"
                        value={customPeriod}
                        onChange={(e) => setCustomPeriod(e.target.value)}
                        placeholder="Enter days (1-1000)"
                        className="input-primary w-full"
                        min="1"
                        max="1000"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    className="text-sm text-secondary hover:text-accent-blue transition-colors duration-300"
                    onClick={() => setIsCustomPeriod(!isCustomPeriod)}
                  >
                    {isCustomPeriod ? "Choose preset period" : "Set custom period"}
                  </button>
                </div>

                <div className="mb-8 p-4 rounded-lg bg-primary/10 border border-primary/30 flex items-start">
                  <Info size={20} className="text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-secondary">
                    Funds will be locked until the period ends. Early withdrawal is possible with a 5% penalty fee.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center">
                    <Clock size={20} className="text-secondary mr-2" />
                    <span className="text-text-secondary">
                      Lock until:{" "}
                      {new Date(
                        Date.now() + Number.parseInt(effectiveLockPeriod) * 24 * 60 * 60 * 1000,
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !amount || (!effectiveLockPeriod && !customPeriod)}
                    className={`btn-primary w-full md:w-auto flex items-center justify-center ${
                      isSubmitting || !amount || (!effectiveLockPeriod && !customPeriod)
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        {isConnected ? 'Confirm Deposit' : 'Connect Wallet'} 
                        <ArrowRight size={18} className="ml-2" />
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

                <h3 className="text-2xl font-bold mb-2">Deposit Successful!</h3>
                <p className="text-text-secondary mb-2">
                  You have successfully locked {amount} ETH for {effectiveLockPeriod} days.
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
                    Make Another Deposit
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
        </div>
      </div>
    </PageTransition>
  )
}
