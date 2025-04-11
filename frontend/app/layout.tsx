import type React from "react"
import type { Metadata } from "next"
import { Inter, Oswald } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import AppSidebar from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { WalletProvider } from "@/hooks/use-wallet"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })
const oswald = Oswald({ 
  subsets: ["latin"], 
  variable: '--font-oswald', 
  weight: ['200', '300', '400', '500', '600', '700'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: "Time-Locked Wallet",
  description: "Secure your future with time-locked wealth",
  generator: 'dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${oswald.variable} font-oswald bg-background text-text-primary min-h-screen`}>
        <WalletProvider>
          <AppSidebar />
          <div className="ml-64">
            {" "}
            {/* This margin matches the sidebar width */}
            <Header />
            <main className="content-scrollable">{children}</main>
            <footer className="py-4 text-center text-text-secondary text-sm border-t border-gray-800">
              <div className="container mx-auto">
                <div className="flex justify-center space-x-6">
                  <a href="#" className="hover:text-primary hover:underline transition-colors duration-300">
                    About
                  </a>
                  <a href="#" className="hover:text-primary hover:underline transition-colors duration-300">
                    FAQ
                  </a>
                  <a href="#" className="hover:text-primary hover:underline transition-colors duration-300">
                    Contact
                  </a>
                </div>
                <p className="mt-2">Powered by Blockchain</p>
              </div>
            </footer>
          </div>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  )
}


import './globals.css'