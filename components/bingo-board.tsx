"use client"

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
}: BingoBoardProps) {
  const markedSet = new Set(player.marked_positions)

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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-2xl"
    >
      <Card
        className={cn(
          "shadow-2xl transition-all duration-500 border-0 overflow-hidden relative backdrop-blur-xl",
          isMyBoard && isMyTurn && gameStatus === "playing"
            ? "ring-4 ring-emerald-400/50 bg-white/90"
            : "bg-white/80",
          hasWinningLine && "ring-4 ring-amber-400/50 bg-amber-50/90"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-50 pointer-events-none" />

        <CardHeader className={cn(
          "pb-4 border-b px-6 relative z-10",
          isMyBoard ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-100" : "bg-slate-50 border-slate-100"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className={cn(
                "p-2 rounded-xl shadow-lg transition-transform hover:scale-105",
                isMyBoard
                  ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white"
                  : "bg-slate-200 text-slate-500"
              )}>
                <User className="h-5 w-5" />
              </div>
              <div className="text-center sm:text-left">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                  {player.player_name}
                  {hasWinningLine && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <Crown className="h-5 w-5 text-amber-500 fill-amber-500" />
                    </motion.span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  {isMyBoard ? "You" : "Opponent"}
                  {isMyTurn && gameStatus === "playing" && (
                    <span className="text-emerald-600 flex items-center gap-1 animate-pulse">
                      • Active Turn
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center sm:justify-end">
              {isMyBoard ? (
                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shadow-sm border border-emerald-200">
                  Your Board
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1.5 shadow-sm border border-slate-200">
                  <Eye className="h-3 w-3" />
                  Observing
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 px-4 sm:px-6 pb-6 relative z-10">
          <div
            className={cn("grid place-items-stretch", gapClass)}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            <AnimatePresence>
              {player.board.map((number, index) => {
                const isMarked = markedSet.has(index)
                const isClickable = isMyBoard && isMyTurn && !isMarked && gameStatus === "playing" && !isMarkingCell

                return (
                  <motion.button
                    key={`${index}-${number}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.01,
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    whileHover={isClickable ? { scale: 1.05, y: -2 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                    onClick={() => handleCellClick(index)}
                    disabled={!isClickable && !isMarked} // Allow clicking marked/unmarked for potential inspect logic if needed, but standard rules apply
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center relative overflow-hidden transition-colors duration-300",
                      fontClass,
                      "font-bold shadow-sm border",
                      isMarked
                        ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white border-emerald-500 shadow-emerald-200/50 shadow-lg scale-[0.98]"
                        : "bg-white text-slate-700 border-slate-200 hover:border-emerald-200",
                      isClickable && "cursor-pointer hover:shadow-md hover:bg-emerald-50/50",
                      !isMyBoard && "cursor-default opacity-90",
                      !isClickable && isMyBoard && !isMarked && "cursor-not-allowed opacity-60 bg-slate-50"
                    )}
                  >
                    {/* Background pattern for texture */}
                    {isMarked && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        className="absolute inset-0 bg-[radial-gradient(#00000020_1px,transparent_1px)] [background-size:16px_16px]"
                      />
                    )}

                    <span className="relative z-10 drop-shadow-sm">{number}</span>

                    {/* Selection indicator for current turn */}
                    {isClickable && (
                      <motion.div
                        className="absolute inset-0 rounded-xl ring-2 ring-emerald-400 ring-offset-2 ring-offset-white opacity-0"
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Dynamic Status Bar */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {isMyTurn && gameStatus === "playing" ? (
                <motion.div
                  key="my-turn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-xl shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse" />
                  <p className="text-white font-bold text-center flex items-center justify-center gap-2 text-sm sm:text-base">
                    <span className="animate-bounce">👉</span> It's your turn! Pick a number
                  </p>
                </motion.div>
              ) : !isMyTurn && gameStatus === "playing" ? (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-100 p-4 rounded-xl border border-slate-200"
                >
                  <p className="text-slate-500 text-center font-medium flex items-center justify-center gap-2 text-sm sm:text-base">
                    <span className="animate-spin text-xl">⏳</span> Waiting for opponent...
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
