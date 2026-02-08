"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Clock, Copy, Check, Star } from "lucide-react"
import type { GameStatus, PlayerNumber, Player } from "@/lib/types"
import { getCompletedLinesWithDetails } from "@/lib/game-utils"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface GameHeaderProps {
  roomCode: string
  currentTurn: PlayerNumber | null
  myPlayerNumber: PlayerNumber
  winner: PlayerNumber | null
  status: GameStatus
  calledNumbers: number[]
  allPlayers: Player[]
  gridSize: number
  playerCount: number
}

export function GameHeader({
  roomCode,
  currentTurn,
  myPlayerNumber,
  winner,
  status,
  calledNumbers,
  allPlayers,
  gridSize,
  playerCount,
}: GameHeaderProps) {
  const [copied, setCopied] = useState(false)
  const isMyTurn = currentTurn === myPlayerNumber
  const didIWin = winner === myPlayerNumber

  const myPlayer = allPlayers.find((p) => p.player_number === myPlayerNumber)
  const myLines = myPlayer
    ? getCompletedLinesWithDetails(myPlayer.marked_positions as number[], gridSize)
    : { completedCount: 0, bingoLetters: [], lineDetails: [], completedLines: [] }

  const currentTurnPlayer = allPlayers.find((p) => p.player_number === currentTurn)

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card className="p-4 md:p-6 shadow-xl border-0 bg-white/80 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-transparent blur-2xl -z-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Room Code Section */}
          <div className="flex items-center gap-4 w-full sm:w-auto p-3 rounded-2xl bg-white/50 border border-white/60 shadow-sm">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg shadow-emerald-200">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Room Code</p>
              <div className="flex items-center gap-3">
                <p className="text-xl md:text-2xl font-black text-slate-800 tracking-widest font-mono">{roomCode}</p>
                <div className="h-6 w-px bg-emerald-200 mx-1" />
                <button
                  onClick={handleCopyRoomCode}
                  className="p-2 hover:bg-emerald-100 rounded-lg transition-all active:scale-95 group"
                  title="Copy room code"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-4 w-4 text-emerald-600" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Copy className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>

          {/* Turn Status Badge */}
          <div className="flex items-center justify-center w-full sm:w-auto">
            <AnimatePresence mode="wait">
              {status === "finished" && winner ? (
                <motion.div
                  key="winner"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge
                    className={cn(
                      "text-sm md:text-base px-6 py-3 rounded-full font-bold shadow-lg animate-pulse",
                      didIWin
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-amber-300"
                        : "bg-slate-200 text-slate-700 border-slate-300",
                    )}
                  >
                    <Trophy className="mr-2 h-5 w-5" />
                    {didIWin ? "You Won! 🎉" : `${allPlayers.find((p) => p.player_number === winner)?.player_name} Won! 🏆`}
                  </Badge>
                </motion.div>
              ) : (
                <motion.div
                  key="turn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Badge
                    className={cn(
                      "text-sm md:text-base px-6 py-3 rounded-full transition-all duration-300 font-bold shadow-lg border",
                      isMyTurn
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-emerald-200"
                        : "bg-white text-slate-600 border-slate-200",
                    )}
                  >
                    <Clock className={cn("mr-2 h-5 w-5", isMyTurn && "animate-spin-slow")} />
                    {isMyTurn ? "It's Your Turn!" : `${currentTurnPlayer?.player_name}'s Turn`}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Players Section */}
        <div className="mt-6 pt-6 border-t border-slate-100 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Active Players
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {allPlayers.map((player) => {
              const isCurrentPlayer = player.player_number === myPlayerNumber
              const isCurrentTurn = player.player_number === currentTurn
              return (
                <motion.div
                  layout
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: isCurrentTurn ? -4 : 0,
                    boxShadow: isCurrentTurn ? "0 10px 25px -5px rgba(16, 185, 129, 0.3)" : "none"
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300 border",
                    isCurrentTurn
                      ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900 ring-2 ring-emerald-500 ring-offset-2"
                      : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100",
                    isCurrentPlayer && "font-bold pr-5",
                  )}
                >
                  <div className="bg-white rounded-full p-1 shadow-sm text-lg sm:text-xl">
                    {player.player_avatar || "👤"}
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-none">{player.player_name}</span>
                    {isCurrentPlayer && <span className="text-[10px] text-emerald-600 font-bold leading-tight mt-0.5">YOU</span>}
                  </div>
                  {isCurrentTurn && (
                    <motion.div
                      layoutId="turn-indicator"
                      className="w-2 h-2 rounded-full bg-emerald-500 ml-2 animate-pulse"
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* BINGO Progress Section */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              Your Progress
            </p>
            <div className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">
              {myLines.completedCount} / {gridSize} Lines
            </div>
          </div>

          <div className="flex justify-center gap-2 sm:gap-4 perspective-1000">
            {["B", "I", "N", "G", "O", ...Array(Math.max(0, (playerCount || 2) - 2)).fill("O")].map((letter, index) => {
              const completedLine = myLines.completedLines[index]
              const isCompleted = index < myLines.completedCount

              // Vibrant distinct colors for each letter
              const colors = [
                'from-red-500 to-rose-600 shadow-red-200',
                'from-blue-500 to-indigo-600 shadow-blue-200',
                'from-green-500 to-emerald-600 shadow-green-200',
                'from-yellow-400 to-orange-500 shadow-orange-200',
                'from-purple-500 to-violet-600 shadow-purple-200',
              ]

              const colorClass = colors[index % colors.length]
              const isLastCompleted = index === myLines.completedCount - 1 && isCompleted

              return (
                <motion.div
                  key={index}
                  initial={{ rotateX: 0 }}
                  animate={{
                    rotateX: isCompleted ? 360 : 0,
                    scale: isCompleted ? 1.1 : 1,
                    y: isCompleted ? -5 : 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: isCompleted ? index * 0.1 : 0
                  }}
                  className={cn(
                    "w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-300 shadow-lg border-b-4",
                    isCompleted
                      ? `bg-gradient-to-b ${colorClass} text-white border-black/20`
                      : "bg-slate-100 text-slate-300 border-slate-200"
                  )}
                  title={isCompleted ? `Line Verified!` : "Needs completion"}
                >
                  {letter}
                  {isCompleted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + (index * 0.1) }}
                      className="absolute -top-2 -right-2 bg-white text-emerald-600 rounded-full p-0.5 shadow-sm"
                    >
                      <Star className="w-3 h-3 fill-current" />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>

          <AnimatePresence>
            {myLines.completedCount >= gridSize && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1.1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="text-center mt-6"
              >
                <div className="inline-block px-8 py-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 text-white font-black text-2xl shadow-xl shadow-amber-200 animate-bounce">
                  ✨ BINGO! ✨
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Called Numbers Ticker */}
        {calledNumbers.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Live Calls ({calledNumbers.length})</p>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />

              <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide px-4 mask-image-linear-gradient">
                <AnimatePresence initial={false}>
                  {[...calledNumbers].reverse().map((num, i) => (
                    <motion.div
                      key={num}
                      initial={{ opacity: 0, x: -20, scale: 0.5 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold border shadow-sm",
                        i === 0
                          ? "bg-slate-900 text-white border-slate-800 scale-110 ring-2 ring-slate-200 ring-offset-2"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      )}
                    >
                      {num}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
