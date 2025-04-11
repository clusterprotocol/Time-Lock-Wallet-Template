"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Upload, Download, Settings, Hexagon } from "lucide-react"
import Logo from "./logo"

export default function AppSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Deposit",
      href: "/deposit",
      icon: Upload,
    },
    {
      title: "Withdraw",
      href: "/withdraw",
      icon: Download,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-background border-r border-gray-800 z-50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-4 border-b border-gray-800">
          <Logo iconSize={32} />
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-3">
          <ul className="space-y-2">
            {routes.map((route) => {
              const isActive = pathname === route.href
              return (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className={`
                      flex items-center px-4 py-3 rounded-lg transition-all duration-300
                      font-ersota tracking-wider text-base
                      ${
                        isActive
                          ? "bg-primary text-white neo-glow"
                          : "text-text-secondary hover:bg-gray-800 hover:text-white"
                      }
                    `}
                  >
                    <route.icon className={`mr-3 ${isActive ? "text-white" : "text-secondary"}`} size={20} />
                    <span>{route.title}</span>
                    {isActive && <div className="ml-auto w-1.5 h-6 bg-secondary rounded-full"></div>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="futuristic-border rounded-lg p-3 text-center">
            <p className="text-xs text-text-secondary">Secured by</p>
            <p className="font-oswald text-secondary">Blockchain</p>
          </div>
        </div>
      </div>
    </div>
  )
}
