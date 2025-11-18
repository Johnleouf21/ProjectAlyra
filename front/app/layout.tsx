import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { headers } from 'next/headers'
import ContextProvider from '@/context'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voting DApp | Decentralized Voting System",
  description: "A secure and transparent decentralized voting platform built with Next.js, Solidity, and Web3. Create proposals, vote securely, and see results in real-time on Ethereum Sepolia testnet.",
  keywords: ["voting", "dapp", "blockchain", "ethereum", "web3", "decentralized", "smart contract", "solidity", "governance"],
  authors: [{ name: "Alyra" }],
  creator: "Alyra",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://voting-dapp.vercel.app",
    title: "Voting DApp | Decentralized Voting System",
    description: "A secure and transparent decentralized voting platform built with Next.js, Solidity, and Web3. Create proposals, vote securely, and see results in real-time.",
    siteName: "Voting DApp",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Voting DApp - Decentralized Voting System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voting DApp | Decentralized Voting System",
    description: "A secure and transparent decentralized voting platform built with Next.js, Solidity, and Web3.",
    images: ["/og-image.png"],
    creator: "@alyra",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const headersObj = await headers();
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ContextProvider cookies={cookies}>
            {children}
            <Toaster position="top-right" richColors />
          </ContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
