"use client"

import type React from "react"

import { useState } from "react"
import { Save, Bell, Zap, Shield, Check } from "lucide-react"
import LoadingSpinner from "@/components/loading-spinner"
import PageTransition from "@/components/page-transition"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [walletNotifications, setWalletNotifications] = useState(true)
  const [network, setNetwork] = useState("mainnet")
  const [gasPreference, setGasPreference] = useState("standard")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate saving settings
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Success",
        description: "Settings saved successfully",
        duration: 3000,
      })
    }, 1500)
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 font-oswald">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 font-oswald">Wallet Settings</h1>
          <div className="w-20 h-1 bg-primary mb-8"></div>

          <div className="card relative overflow-hidden">
            {/* Animated background */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-wave"
              style={{ backgroundSize: "200% 200%" }}
            ></div>

            <div className="relative z-10">
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center font-oswald">
                    <Bell size={20} className="mr-2 text-secondary" />
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="emailNotifications" className="flex-1 font-oswald">
                        <span className="font-medium">Email Notifications</span>
                        <p className="text-sm text-text-secondary">Receive updates about your locks via email</p>
                      </label>
                      <Switch
                        id="emailNotifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="walletNotifications" className="flex-1 font-oswald">
                        <span className="font-medium">Wallet Notifications</span>
                        <p className="text-sm text-text-secondary">Receive notifications in your wallet</p>
                      </label>
                      <Switch
                        id="walletNotifications"
                        checked={walletNotifications}
                        onCheckedChange={setWalletNotifications}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center font-oswald">
                    <Shield size={20} className="mr-2 text-secondary" />
                    Network Settings
                  </h2>

                  <div className="mb-4">
                    <label htmlFor="network" className="block text-sm font-medium mb-2 font-oswald">
                      Preferred Network
                    </label>
                    <select
                      id="network"
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      className="input-primary w-full font-oswald"
                    >
                      <option value="mainnet">Ethereum Mainnet</option>
                      <option value="sepolia">Sepolia Testnet</option>
                      <option value="goerli">Goerli Testnet</option>
                      <option value="arbitrum">Arbitrum</option>
                      <option value="optimism">Optimism</option>
                    </select>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center font-oswald">
                    <Zap size={20} className="mr-2 text-secondary" />
                    Gas Settings
                  </h2>

                  <div className="grid grid-cols-3 gap-3">
                    {["slow", "standard", "fast"].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        className={`py-3 px-4 rounded-lg border transition-all duration-300 font-oswald ${
                          gasPreference === speed
                            ? "border-secondary bg-secondary/10 text-white"
                            : "border-gray-700 text-text-secondary hover:border-secondary"
                        }`}
                        onClick={() => setGasPreference(speed)}
                      >
                        <div className="capitalize font-medium">{speed}</div>
                        <div className="text-sm text-text-secondary mt-1">
                          {speed === "slow" && "Cheaper (~5 min)"}
                          {speed === "standard" && "Balanced (~2 min)"}
                          {speed === "fast" && "Faster (~30 sec)"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`btn-primary flex items-center font-oswald ${isSubmitting ? "opacity-70" : ""}`}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Save size={18} className="mr-2" /> Save Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
