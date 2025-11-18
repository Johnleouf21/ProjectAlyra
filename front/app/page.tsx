'use client'

import { useAccount } from 'wagmi'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { VotingDashboard } from '@/components/VotingDashboard'
import { Lock } from 'lucide-react'

export default function Home() {
  const { address, isConnected } = useAccount()

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] text-center">
            <div className="space-y-6 max-w-md">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                  <Lock className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Connect Your Wallet</h2>
                <p className="text-muted-foreground">
                  Connect your wallet to participate in the decentralized voting system.
                  Your vote matters!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <VotingDashboard address={address!} />
        )}
      </main>

      <Footer />
    </div>
  )
}
