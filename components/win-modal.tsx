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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card className="w-full bg-white/95 backdrop-blur-2xl shadow-2xl border-white/20 ring-1 ring-black/5 rounded-[24px] overflow-hidden">
          <CardHeader className="text-center space-y-4 p-8 pb-6 relative">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-50/80 to-transparent pointer-events-none" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              className="relative mx-auto w-28 h-28 flex items-center justify-center"
            >
              {/* Soft Radial Glow */}
              <div className={cn(
                "absolute inset-0 rounded-full blur-2xl opacity-40",
                didIWin ? "bg-amber-400" : "bg-slate-300"
              )} />

              <div className={cn(
                "relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/80",
                didIWin
                  ? "bg-gradient-to-br from-amber-300 to-orange-400"
                  : "bg-slate-100"
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
                    transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white"
                  >
                    {gridSize}
                  </motion.div>
                )}
              </div>
            </motion.div>

            <div className="space-y-1 relative z-10">
              {didIWin && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 py-1"
                >
                  BINGO!
                </motion.div>
              )}
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                {didIWin ? 'Victory!' : 'Game Over'}
              </h3>
              <p className="text-slate-500 font-medium text-sm">
                {didIWin
                  ? 'Congratulations! You are the champion! 🎉'
                  : <span className="flex items-center justify-center gap-2">
                    <span className="font-bold text-slate-800">{winnerName}</span> won the game! 🏆
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
                transition={{ delay: 0.3 }}
                className="bg-emerald-50/50 rounded-2xl p-4 text-center border border-emerald-100/50 text-emerald-800 shadow-sm"
              >
                <div className="text-sm font-bold">Perfect Game!</div>
                <div className="text-xs text-emerald-600/80 mt-0.5 font-medium">You completed {gridSize} lines</div>
              </motion.div>
            )}

            <div className="space-y-3 pt-2">
              <Button
                onClick={() => onRematch(false)}
                className="w-full h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white text-base font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl border-none"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Play Again
              </Button>

              <Button
                onClick={() => onRematch(true)}
                variant="outline"
                className="w-full h-12 text-sm font-medium border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all rounded-xl"
              >
                <Settings className="mr-2 h-4 w-4" />
                Rematch with New Board
              </Button>

              <div className="flex space-x-3 pt-4 border-t border-slate-100 mt-4">
                <Button
                  onClick={handleExitRoom}
                  disabled={isExiting}
                  variant="ghost"
                  className="flex-1 h-9 text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  {isExiting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Exiting
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Exit
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => router.push('/')}
                  variant="ghost"
                  className="flex-1 h-9 text-xs font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <Home className="mr-2 h-3.5 w-3.5" />
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
