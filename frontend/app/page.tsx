import Link from "next/link"

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col">
      {/* Animated particles background */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="glass-card max-w-4xl mx-auto text-center p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center animate-float">
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
              className="text-background"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Secure Your Future with <span className="gradient-text">Time-Locked Wealth</span>
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary mb-8">Deposit, Lock, and Withdraw with Confidence</p>

          <Link href="/deposit" className="btn-primary text-lg px-8 py-3 inline-block">
            Get Started
          </Link>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg border border-gray-800 hover:border-secondary transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2">Secure Deposits</h3>
              <p className="text-text-secondary">Lock your assets with customizable time periods</p>
            </div>

            <div className="p-4 rounded-lg border border-gray-800 hover:border-secondary transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2">Time-Locked</h3>
              <p className="text-text-secondary">Funds are securely locked until the period expires</p>
            </div>

            <div className="p-4 rounded-lg border border-gray-800 hover:border-secondary transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2">Flexible Options</h3>
              <p className="text-text-secondary">Choose from various lock periods with optional early withdrawal</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
