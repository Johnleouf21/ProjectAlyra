'use client'

import { Github, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Voting DApp</h3>
            <p className="text-sm text-muted-foreground">
              A decentralized voting platform built with Next.js, Solidity, and Hardhat.
              Secure, transparent, and verifiable on-chain voting.
            </p>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Built With</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Next.js 16 & React 19
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Solidity & Hardhat 3
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Wagmi & Reown AppKit
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Tailwind CSS & shadcn/ui
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Resources</h3>
            <div className="flex flex-col gap-2">
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                View on GitHub
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="https://sepolia.etherscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View on Etherscan
              </Link>
              <Link
                href="https://alyra.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Alyra School
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Voting DApp. Built for Alyra School.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with ❤️ by students learning Web3
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
