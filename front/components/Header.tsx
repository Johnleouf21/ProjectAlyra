'use client'

import { ConnectButton } from './ConnectButton'
import { ThemeToggle } from './ThemeToggle'
import { useAccount } from 'wagmi'
import { Badge } from '@/components/ui/badge'
import { Wallet } from 'lucide-react'

export function Header() {
  const { address, isConnected } = useAccount()

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Voting DApp</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Decentralized Voting System
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && address && (
            <Badge variant="outline" className="hidden md:flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </Badge>
          )}
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
