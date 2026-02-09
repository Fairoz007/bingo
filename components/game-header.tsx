"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Clock, Copy, Check, Star } from "lucide-react"
import type { GameStatus, PlayerNumber, Player } from "@/lib/types"
import { getCompletedLinesWithDetails } from "@/lib/game-utils"
import { useState, useEffect } from "react"
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
  turnExpiresAt?: number
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
  turnExpiresAt,
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
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto space-y-6 select-none"
    >
      {/* Top Bar: Room Status & Turn Indicator */}
      <div className="flex items-stretch justify-between gap-3 px-1">

        {/* Room & Turn - Merged Compact Bar */}
        <div className="flex-1 flex items-center bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-1.5 gap-2 overflow-hidden relative">

          {/* Room Code Pill */}
          <motion.button
            onClick={handleCopyRoomCode}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100/80 rounded-xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors group"
            title="Copy Room Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-xs font-bold font-mono tracking-wider">{roomCode}</span>
          </motion.button>

          <div className="w-px h-6 bg-slate-200" />

          {/* Turn Status - The focus point */}
          <AnimatePresence mode="wait">
            {status === "finished" && winner ? (
              <motion.div
                key="winner"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex items-center justify-center gap-2 text-amber-600 font-bold text-sm px-2 truncate"
              >
                <Trophy className="w-4 h-4" />
                <span className="truncate">{didIWin ? "You Won!" : `${allPlayers.find(p => p.player_number === winner)?.player_name.split(' ')[0]} Won!`}</span>
              </motion.div>
            ) : (
              <motion.div
                key="turn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-500 relative overflow-hidden",
                  isMyTurn
                    ? "bg-emerald-100/50 text-emerald-800"
                    : "text-slate-500"
                )}
              >
                {isMyTurn && (
                  <motion.div
                    layoutId="turn-highlight"
                    className="absolute inset-0 rounded-xl border border-emerald-500/30"
                    animate={{ boxShadow: ["0 0 0 0px rgba(16,185,129,0)", "0 0 0 4px rgba(16,185,129,0.1)", "0 0 0 0px rgba(16,185,129,0)"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                <div className="flex items-center gap-2 z-10">
                  <span className={cn("w-2 h-2 rounded-full", isMyTurn ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                  <span className="text-xs sm:text-sm font-bold truncate">
                    {isMyTurn ? "YOUR TURN" : `${currentTurnPlayer?.player_name}'s Turn`}
                  </span>

                  {status === "playing" && turnExpiresAt && (
                    <TurnTimer expiresAt={turnExpiresAt} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Player Avatars - Compact Stack */}
        <div className="flex bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-1.5">
          <div className="flex items-center -space-x-2">
            {allPlayers.map((player) => {
              const isTurn = player.player_number === currentTurn
              return (
                <motion.div
                  key={player.id}
                  layout
                  className={cn(
                    "relative w-9 h-9 rounded-full border-2 border-white flex items-center justify-center shadow-sm overflow-hidden transition-all duration-300",
                    isTurn ? "z-10 bg-emerald-50 ring-2 ring-emerald-400 ring-offset-2 scale-105" : "bg-slate-100 grayscale-[0.3]"
                  )}
                  title={player.player_name}
                >
                  <span className="text-xs">{player.player_avatar || "👤"}</span>
                  {/* Online dot - assuming active = online */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full translate-x-0.5 translate-y-0.5 z-20" />

                  {/* Active Ring Animation */}
                  {isTurn && (
                    <motion.div
                      className="absolute inset-0 rounded-full border border-emerald-400"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Stats & Progress Card */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl rounded-[1.5rem] overflow-hidden relative">
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/40 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="p-5 sm:p-6 space-y-6">

          {/* Bingo Progress Section */}
          <div className="space-y-4">
            <div className="flex items-end justify-between px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Complete Lines</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full leading-none">
                {myLines.completedCount} / {gridSize}
              </span>
            </div>

            <div className="flex justify-between gap-2 sm:gap-3">
              {["B", "I", "N", "G", "O", ...Array(Math.max(0, (playerCount || 2) - 2)).fill("O")].map((letter, index) => {
                const isCompleted = index < myLines.completedCount

                // Gradient definitions for completed states
                const gradients = [
                  'bg-gradient-to-br from-red-500 to-rose-600',
                  'bg-gradient-to-br from-blue-500 to-indigo-600',
                  'bg-gradient-to-br from-emerald-500 to-green-600',
                  'bg-gradient-to-br from-amber-400 to-orange-500',
                  'bg-gradient-to-br from-purple-500 to-violet-600',
                ]
                const activeGradient = gradients[index % gradients.length]

                return (
                  <div key={index} className="flex-1 relative group">
                    <motion.div
                      animate={{
                        y: isCompleted ? -2 : 0,
                        scale: isCompleted ? 1.05 : 1
                      }}
                      className={cn(
                        "aspect-[3/4] sm:aspect-square rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-500 shadow-sm",
                        isCompleted
                          ? cn(activeGradient, "text-white shadow-md shadow-emerald-200/50")
                          : "bg-slate-50/50 text-slate-300 border border-dashed border-slate-200"
                      )}
                    >
                      <span className="text-lg sm:text-xl font-black">{letter}</span>

                      {/* Shine effect for completed */}
                      {isCompleted && (
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                      )}
                    </motion.div>

                    {/* Connection line between nodes (visual decoration only - simple implementation) */}
                    {index < (playerCount || 2) + 2 && (
                      <div className={cn(
                        "absolute top-1/2 -right-2 sm:-right-3 w-2 sm:w-3 h-0.5 -translate-y-1/2 z-0",
                        index < myLines.completedCount - 1 ? "bg-emerald-200" : "bg-transparent"
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Live Calls Strip */}
          {calledNumbers.length > 0 && (
            <div className="pt-6 border-t border-slate-100/80">
              <div className="flex items-center justify-between px-1 mb-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Called</span>
                </div>
              </div>

              <div className="relative h-16 overflow-hidden mask-image-linear-gradient flex items-center">
                <div className="absolute left-0 z-10 w-12 h-full bg-gradient-to-r from-white to-transparent" />
                <div className="absolute right-0 z-10 w-12 h-full bg-gradient-to-l from-white to-transparent" />

                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide px-6 w-full py-2">
                  <AnimatePresence initial={false} mode="popLayout">
                    {[...calledNumbers].reverse().map((num, i) => (
                      <motion.div
                        key={`${num}-${i}`}
                        layout
                        initial={{ opacity: 0, scale: 0.5, x: -20 }}
                        animate={{
                          opacity: i === 0 ? 1 : 0.6 - (i * 0.1),
                          scale: i === 0 ? 1 : 0.85,
                          x: 0
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className={cn(
                          "flex-shrink-0 flex items-center justify-center font-mono font-bold rounded-2xl shadow-sm transition-all duration-300",
                          i === 0
                            ? "w-12 h-12 bg-slate-800 text-white text-lg shadow-lg ring-4 ring-white"
                            : "w-10 h-10 bg-slate-100 text-slate-500 text-sm"
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
        </div>
      </Card>
    </motion.div>
  )
}

function TurnTimer({ expiresAt }: { expiresAt: number }) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000))
      setTimeLeft(remaining)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (timeLeft <= 0) return null

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-bold font-mono transition-colors",
      timeLeft <= 10 ? "bg-red-100 text-red-600 animate-pulse" : "bg-emerald-100 text-emerald-600"
    )}>
      <Clock className="w-3 h-3" />
      <span>{timeLeft}s</span>
    </div>
  )
}
