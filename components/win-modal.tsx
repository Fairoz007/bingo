"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Home, RotateCcw, LogOut, Settings } from "lucide-react"
import { useEffect, useState } from "react"

interface WinModalProps {
  didIWin: boolean
  winnerName: string
  roomId: string
  playerNumber: string
  onRematch: (reconfigureBoard: boolean) => void
  gridSize: number
}

export function WinModal({ didIWin, winnerName, roomId, playerNumber, onRematch, gridSize }: WinModalProps) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleExitRoom = async () => {
    setIsExiting(true)
    try {
      const response = await fetch("/api/game/exit-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerNumber }),
      })

      if (!response.ok) {
        throw new Error("Failed to exit room")
      }

      router.push("/")
    } catch (error) {
      console.error("[v0] Error exiting room:", error)
      alert("Failed to exit room. Please try again.")
      setIsExiting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-300">
      <Card
        className={`w-full max-w-md shadow-2xl transform transition-all duration-500 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <CardHeader className="text-center space-y-3 sm:space-y-4 pb-3 sm:pb-4 px-4 sm:px-6">
          <div className="flex justify-center">
            <div className={`rounded-full p-4 sm:p-6 ${didIWin ? "bg-yellow-100 animate-bounce" : "bg-muted"}`}>
              <Trophy
                className={`h-12 w-12 sm:h-16 sm:w-16 ${didIWin ? "text-yellow-600" : "text-muted-foreground"}`}
              />
            </div>
          </div>
          {didIWin && (
            <div className="text-4xl sm:text-6xl font-black tracking-widest text-primary animate-pulse">BINGO!</div>
          )}
          <CardTitle className="text-2xl sm:text-3xl font-bold text-balance">
            {didIWin ? "Congratulations!" : "Game Over"}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg">
            {didIWin ? "You won the game!" : `${winnerName} won the game!`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6">
          {didIWin && (
            <div className="bg-primary/10 rounded-lg p-3 sm:p-4 text-center mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-medium text-primary">
                You completed all {gridSize} lines{gridSize === 5 ? " (B-I-N-G-O)" : ""}!
              </p>
            </div>
          )}

          <Button
            onClick={() => onRematch(false)}
            className="w-full h-11 sm:h-12 text-sm sm:text-lg"
            size="lg"
            variant="default"
          >
            <RotateCcw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Play Again (Same Board)
          </Button>

          <Button
            onClick={() => onRematch(true)}
            className="w-full h-11 sm:h-12 text-sm sm:text-lg"
            size="lg"
            variant="outline"
          >
            <Settings className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Reconfigure Board
          </Button>

          <Button
            onClick={handleExitRoom}
            disabled={isExiting}
            className="w-full h-11 sm:h-12 text-sm sm:text-lg bg-transparent"
            size="lg"
            variant="outline"
          >
            <LogOut className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            {isExiting ? "Exiting..." : "Exit Room"}
          </Button>

          <Button
            onClick={() => router.push("/")}
            className="w-full h-11 sm:h-12 text-sm sm:text-lg"
            size="lg"
            variant="secondary"
          >
            <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
