import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ConvexClientProvider } from "@/components/ConvexClientProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bingo Game - Play with Friends",
  description: "Multiplayer Bingo game for 2-6 players",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
