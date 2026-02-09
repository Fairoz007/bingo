"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Player, GameStatus, PlayerNumber } from "@/lib/types"
import { cn } from "@/lib/utils"
import { User, Crown, Eye } from "lucide-react"
import { getCompletedLinesWithDetails } from "@/lib/game-utils"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { motion, AnimatePresence } from "framer-motion"
import { playSound } from "@/lib/audio"

interface BingoBoardProps {
  player: Player
  isMyBoard: boolean
  isMyTurn: boolean
  roomId: string
  gameStatus: GameStatus
  gridSize?: number
  playerCount?: number
  isMarkingCell?: boolean
  setIsMarkingCell?: (value: boolean) => void
  winner?: PlayerNumber | null
  turnExpiresAt?: number
}

export function BingoBoard({
  player,
  isMyBoard,
  isMyTurn,
  roomId,
  gameStatus,
  gridSize = 5,
  playerCount = 2,
  isMarkingCell = false,
  setIsMarkingCell,
  winner,
  turnExpiresAt,
}: BingoBoardProps) {
  const markedSet = new Set(player.marked_positions)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!turnExpiresAt || gameStatus !== "playing") {
      setTimeLeft(0)
      return
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((turnExpiresAt - Date.now()) / 1000))
      setTimeLeft(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [turnExpiresAt, gameStatus])

  const { completedLines } = getCompletedLinesWithDetails(player.marked_positions as number[], gridSize)

  const denseGrid = gridSize >= 8
  const gapClass = denseGrid ? "gap-1 sm:gap-1.5 md:gap-2" : "gap-2 sm:gap-3 md:gap-4"
  const fontClass = denseGrid ? "text-xs sm:text-sm md:text-base" : "text-sm sm:text-base md:text-lg"

  const mark = useMutation(api.game.mark)

  const handleCellClick = async (index: number) => {
    if (!isMyBoard || !isMyTurn || markedSet.has(index) || gameStatus === "finished" || isMarkingCell) {
      if (!isMyTurn && isMyBoard && gameStatus === "playing") {
        playSound("error") // Play error sound
      } else if (markedSet.has(index)) {
        playSound("error")
      }
      return
    }

    playSound("click") // Play click sound

    if (setIsMarkingCell) {
      setIsMarkingCell(true)
    }

    try {
      await mark({
        roomId: roomId as Id<"rooms">,
        playerNumber: player.player_number,
        position: index,
      })
    } catch (error: any) {
      console.error("[v0] Mark cell error:", error)
      alert(error.message || "Failed to mark cell")
    } finally {
      if (setIsMarkingCell) {
        setIsMarkingCell(false)
      }
    }
  }

  const hasWinningLine = gameStatus === "finished" && winner === player.player_number

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto px-1"
    >
      <div className={cn(
        "relative rounded-[2rem] overflow-hidden transition-all duration-500",
        isMyBoard && isMyTurn && gameStatus === "playing"
          ? "bg-white shadow-[0_20px_50px_-12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/30"
          : "bg-white/80 shadow-2xl shadow-slate-200/50 border border-white/60",
        hasWinningLine && "ring-4 ring-amber-300 shadow-amber-200/50"
      )}>

        {/* Header Section - Slightly darker bg for hierarchy */}
        <div className="relative z-10 flex items-center justify-between p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100/80">
          <div className="flex items-center gap-4">
            <div className={cn(
              "relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform hover:scale-105",
              isMyBoard
                ? "bg-emerald-100 text-emerald-600"
                : "bg-slate-100 text-slate-400"
            )}>
              <User className="w-6 h-6" />
              {hasWinningLine && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-2 -left-2 bg-amber-400 text-white p-1 rounded-full shadow-md"
                >
                  <Crown className="w-3.5 h-3.5 fill-current" />
                </motion.div>
              )}
            </div>

            <div className="flex flex-col">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-tight">
                {player.player_name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {isMyBoard ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 uppercase tracking-wide shadow-sm">YOU</span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 uppercase tracking-wide">Opponent</span>
                )}
                {isMyTurn && gameStatus === "playing" && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {timeLeft > 0 && gameStatus === "playing" && (
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full font-mono font-bold text-base shadow-sm bg-white border relative overflow-hidden",
                      timeLeft <= 10 ? "text-red-500 border-red-100" : "text-emerald-600 border-emerald-100"
                    )}
                  >
                    <span className="relative z-10">{timeLeft}</span>
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                      <circle
                        cx="20" cy="20" r="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="113"
                        strokeDashoffset={113 * (1 - timeLeft / 30)}
                        className={cn("opacity-10 transition-all duration-1000 linear")}
                      />
                    </svg>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Grid Section - Inner shadow container */}
        <div className="p-4 sm:p-6 bg-white relative">
          {/* Subtle inner shadow for depth */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)]" />

          <div
            className={cn("relative z-10 grid place-items-stretch", gapClass)}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            <AnimatePresence mode="popLayout">
              {player.board.map((number, index) => {
                const isMarked = markedSet.has(index)
                const isClickable = isMyBoard && isMyTurn && !isMarked && gameStatus === "playing" && !isMarkingCell

                return (
                  <motion.button
                    key={`${index}-${number}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={isClickable ? {
                      y: -3,
                      boxShadow: "0 8px 20px -4px rgba(16,185,129,0.15)",
                      scale: 1.02
                    } : {}}
                    whileTap={isClickable ? { scale: 0.94 } : {}}
                    onClick={() => handleCellClick(index)} // Corrected onClick handler
                    disabled={!isClickable && !isMarked}
                    className={cn(
                      "aspect-square rounded-[1rem] flex items-center justify-center relative transition-all duration-300",
                      fontClass,
                      "font-bold tracking-tight select-none",
                      isMarked
                        ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-200/40 ring-2 ring-white ring-offset-2 ring-offset-emerald-100/50"
                        : "bg-white text-slate-700 shadow-sm border border-slate-100 hover:border-emerald-200",
                      isClickable && "cursor-pointer",
                      !isMyBoard && "opacity-80 grayscale-[0.2]",
                      !isClickable && isMyBoard && !isMarked && "opacity-60 cursor-not-allowed bg-slate-50 text-slate-400"
                    )}
                  >
                    <span className="relative z-10">{number}</span>

                    {/* Checkmark overlay - softer */}
                    {isMarked && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.2, scale: 1.2 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-3/4 h-3/4 bg-white/30 rounded-full blur-md" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Status Message - Integrated */}
        <div className="bg-slate-50/50 border-t border-slate-100/80 p-3 flex justify-center min-h-[3.5rem] items-center">
          <AnimatePresence mode="wait">
            {isMyTurn && gameStatus === "playing" ? (
              <motion.div
                key="my-turn"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50/80 px-4 py-1.5 rounded-full"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Tap a number to mark
              </motion.div>
            ) : !isMyTurn && gameStatus === "playing" ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-medium text-slate-400 flex items-center gap-2"
              >
                Waiting for opponent...
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

