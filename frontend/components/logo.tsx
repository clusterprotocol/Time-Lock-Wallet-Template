"use client"

import { Hexagon } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  showIcon?: boolean;
  textSize?: "sm" | "md" | "lg" | "xl";
  className?: string;
  iconSize?: number;
  showText?: boolean;
}

export default function Logo({
  showIcon = true,
  textSize = "md",
  className = "",
  iconSize = 24,
  showText = false,
}: LogoProps) {
  // Text size classes
  const textSizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }

  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      {showIcon && (
        <div className="rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center" 
             style={{ width: `${iconSize + 12}px`, height: `${iconSize + 12}px` }}>
          <Hexagon size={iconSize} className="text-background" />
        </div>
      )}
      {showText && (
        <span className={`font-bold font-ersota gradient-text ${textSizeClasses[textSize]}`}>
          TimeLock
        </span>
      )}
    </Link>
  )
} 