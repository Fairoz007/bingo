"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Clock, Copy, Check } from "lucide-react"
import type { GameStatus, PlayerNumber, Player } from "@/lib/types"
import { getCompletedLinesWithDetails } from "@/lib/game-utils"
import { useState } from "react"
import { cn } from "@/lib/utils"

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

  const allBingoLetters = ["B", "I", "N", "G", "O"]
  const currentTurnPlayer = allPlayers.find((p) => p.player_number === currentTurn)

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card className="p-3 sm:p-4 md:p-6 shadow-lg border-0 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          {/* Room Code Section */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 sm:p-3 rounded-lg shadow-md">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="flex-1 sm:flex-none">
              <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Room Code</p>
              <div className="flex items-center gap-2">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-900 tracking-widest">{roomCode}</p>
                <button
                  onClick={handleCopyRoomCode}
                  className="p-1.5 hover:bg-emerald-200 rounded-lg transition-colors"
                  title="Copy room code"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-emerald-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Turn Status Badge */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {status === "finished" && winner ? (
              <Badge
                className={cn(
                  "text-xs sm:text-sm md:text-base px-3 py-1.5 sm:px-4 sm:py-2 w-full sm:w-auto justify-center font-semibold shadow-md",
                  didIWin
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white"
                    : "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800",
                )}
              >
                <Trophy className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {didIWin ? "You Won!" : `${allPlayers.find((p) => p.player_number === winner)?.player_name} Won!`}
              </Badge>
            ) : (
              <Badge
                className={cn(
                  "text-xs sm:text-sm md:text-base px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-300 w-full sm:w-auto justify-center font-semibold shadow-md",
                  isMyTurn
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white animate-pulse"
                    : "bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700",
                )}
              >
                <Clock className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {isMyTurn ? "Your Turn" : `${currentTurnPlayer?.player_name}'s Turn`}
              </Badge>
            )}
          </div>
        </div>

        {/* Players Section */}
        <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-emerald-200">
          <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide mb-3">
            Players ({allPlayers.length})
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {allPlayers.map((player) => {
              const isCurrentPlayer = player.player_number === myPlayerNumber
              const isCurrentTurn = player.player_number === currentTurn
              return (
                <div
                  key={player.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium",
                    isCurrentTurn
                      ? "bg-gradient-to-r from-emerald-100 to-teal-100 ring-2 ring-emerald-500 text-emerald-900"
                      : "bg-slate-100 text-slate-700",
                    isCurrentPlayer && "font-bold",
                  )}
                >
                  <span className="text-lg sm:text-xl">{player.player_avatar || "👤"}</span>
                  <span>
                    {player.player_name}
                    {isCurrentPlayer && <span className="ml-1 text-emerald-600 font-bold">(You)</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* BINGO Word and Lines Section */}
        <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-emerald-200">
          <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide mb-3 text-center">
            Complete Lines: <span className="text-emerald-600 font-bold">{myLines.completedCount}</span>
          </p>
          <div className="flex justify-center gap-2 sm:gap-3">
            {["B", "I", "N", "G", "O", ...Array(Math.max(0, (playerCount || 2) - 2)).fill("O")].map((letter, index) => {
              const completedLine = myLines.completedLines[index]
              const isCompleted = index < myLines.completedCount
              // Fixed set of colors for consistency
              const colors = [
                'bg-red-500', 'bg-blue-500', 'bg-green-500', 
                'bg-yellow-500', 'bg-purple-500', 'bg-pink-500',
                'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
              ]
              // Use a consistent color based on the letter position
              const colorIndex = index % colors.length
              const bgColor = colors[colorIndex]

              return (
                <div
                  key={index}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md flex items-center justify-center text-lg sm:text-xl font-bold transition-all duration-300 shadow-md ${
                    isCompleted 
                      ? `${bgColor} text-white scale-105` 
                      : 'bg-gray-200 text-gray-400'
                  }`}
                  title={isCompleted ? `Line ${completedLine?.lineNumber} (${completedLine?.type})` : undefined}
                >
                  {letter}
                </div>
              )
            })}
          </div>
          {myLines.completedCount >= gridSize && (
            <p className="text-center mt-3 sm:mt-4 text-lg sm:text-xl md:text-2xl font-bold text-emerald-600 animate-bounce">
              🎉 BINGO! 🎉
            </p>
          )}
        </div>

        {/* Called Numbers Section */}
        {calledNumbers.length > 0 && (
          <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-emerald-200">
            <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide mb-3">
              Called Numbers ({calledNumbers.length})
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-20 sm:max-h-24 overflow-y-auto">
              {calledNumbers.map((num) => (
                <Badge
                  key={num}
                  className="text-xs sm:text-sm font-mono px-2 py-1 sm:px-3 sm:py-1.5 bg-emerald-100 text-emerald-700 border border-emerald-300"
                >
                  {num}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
