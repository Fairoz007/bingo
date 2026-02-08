"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Trophy, Home, RotateCcw, LogOut, Settings, Award } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { playSound } from "@/lib/audio"
import { cn } from "@/lib/utils"

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
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (didIWin) {
      playSound("win")
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
      }, 250)

      return () => clearInterval(interval)
    } else {
      // Optional loss sound?
    }
  }, [didIWin])

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm"
      >
        <Card className="w-full bg-white/90 backdrop-blur-xl shadow-2xl border-0 ring-1 ring-white/20 overflow-hidden">
          <CardHeader className="text-center space-y-4 p-8 pb-6 relative">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-100/50 to-transparent pointer-events-none" />

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto w-24 h-24"
            >
              <div className={cn(
                "absolute inset-0 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white",
                didIWin
                  ? "bg-gradient-to-br from-amber-300 to-yellow-500"
                  : "bg-slate-200"
              )}>
                {didIWin ? (
                  <Trophy className="h-12 w-12 text-white drop-shadow-md" />
                ) : (
                  <Award className="h-12 w-12 text-slate-400" />
                )}

                {didIWin && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md border-2 border-white"
                  >
                    {gridSize}
                  </motion.div>
                )}
              </div>
            </motion.div>

            <div className="space-y-2 relative z-10">
              {didIWin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 py-1"
                >
                  BINGO!
                </motion.div>
              )}
              <h3 className="text-2xl font-bold text-slate-800">
                {didIWin ? 'Victory!' : 'Game Over'}
              </h3>
              <p className="text-slate-600 font-medium">
                {didIWin
                  ? 'Congratulations! You are the champion! 🎉'
                  : <span className="flex items-center justify-center gap-2">
                    <span className="font-bold text-slate-900">{winnerName}</span> won the game! 🏆
                  </span>
                }
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-8 pt-0">
            {didIWin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100 text-emerald-800 shadow-sm"
              >
                <div className="text-sm font-semibold">Perfect Game!</div>
                <div className="text-xs text-emerald-600 mt-1">You completed {gridSize} lines</div>
              </motion.div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => onRematch(false)}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Play Again
              </Button>

              <Button
                onClick={() => onRematch(true)}
                variant="outline"
                className="w-full h-12 text-sm font-medium border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <Settings className="mr-2 h-4 w-4" />
                Rematch with New Board
              </Button>

              <div className="flex space-x-3 pt-2">
                <Button
                  onClick={handleExitRoom}
                  disabled={isExiting}
                  variant="ghost"
                  className="flex-1 h-10 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50"
                >
                  {isExiting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Exiting...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Exit Room
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => router.push('/')}
                  variant="ghost"
                  className="flex-1 h-10 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
