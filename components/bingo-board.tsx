"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Player, GameStatus, PlayerNumber } from "@/lib/types"
import { cn } from "@/lib/utils"
import { User, Crown, Eye } from "lucide-react"
import { getCompletedLinesWithDetails } from "@/lib/game-utils"

interface BingoBoardProps {
  player: Player
  isMyBoard: boolean
  isMyTurn: boolean
  roomId: string
  gameStatus: GameStatus
  gridSize?: number
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
  isMarkingCell = false,
  setIsMarkingCell,
  winner,
}: BingoBoardProps) {
  const markedSet = new Set(player.marked_positions)

  const { completedLines } = getCompletedLinesWithDetails(player.marked_positions as number[], gridSize)

  const denseGrid = gridSize >= 8
  const gapClass = denseGrid ? "gap-1 sm:gap-1.5 md:gap-2" : "gap-1.5 sm:gap-2 md:gap-3"
  const fontClass = denseGrid ? "text-xs sm:text-sm md:text-base" : "text-sm sm:text-base md:text-lg"

  const handleCellClick = async (index: number) => {
    if (!isMyBoard || !isMyTurn || markedSet.has(index) || gameStatus === "finished" || isMarkingCell) {
      if (!isMyTurn && isMyBoard && gameStatus === "playing") {
        alert("Please wait for your turn!")
      } else if (markedSet.has(index)) {
        alert("This number has already been called!")
      }
      return
    }

    if (setIsMarkingCell) {
      setIsMarkingCell(true)
    }

    try {
      const response = await fetch("/api/game/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          playerNumber: player.player_number,
          position: index,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || "Failed to mark cell")
      }
    } catch (error) {
      console.error("[v0] Mark cell error:", error)
      alert("Failed to mark cell. Please try again.")
    } finally {
      if (setIsMarkingCell) {
        setIsMarkingCell(false)
      }
    }
  }

  const hasWinningLine = gameStatus === "finished" && winner === player.player_number

  return (
    <Card
      className={cn(
        "shadow-lg transition-all duration-300 border-0 w-full max-w-2xl overflow-hidden min-w-0",
        isMyBoard && isMyTurn && gameStatus === "playing"
          ? "ring-2 ring-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50"
          : "bg-white",
      )}
    >
      <CardHeader className="pb-3 sm:pb-4 border-b border-emerald-100 px-3 sm:px-6 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 justify-center">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 sm:p-2 rounded-lg shadow-md">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-emerald-900">
                {player.player_name}
              </CardTitle>
              {hasWinningLine && <p className="text-xs text-amber-600 font-semibold">Winner!</p>}
            </div>
            {hasWinningLine && <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 ml-auto sm:ml-0" />}
          </div>
          <div className="flex justify-center sm:justify-end">
            {isMyBoard ? (
              <span className="text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-md">
                Your Board
              </span>
            ) : (
              <span className="text-xs sm:text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1.5">
                <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                View Only
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="text-center text-xs sm:text-sm font-semibold text-emerald-800 mb-2 sm:mb-3">
          {completedLines.length >= gridSize ? "Bingo!" : `Lines: ${completedLines.length}/${gridSize}`}
        </div>
        <div
          className={cn("grid place-items-stretch", gapClass)}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {player.board.map((number, index) => {
            const isMarked = markedSet.has(index)
            const isClickable = isMyBoard && isMyTurn && !isMarked && gameStatus === "playing" && !isMarkingCell

            return (
              <Button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!isClickable}
                variant={isMarked ? "default" : "outline"}
                style={{ aspectRatio: 1, width: "100%" }}
                className={cn(
                  `${fontClass} font-bold transition-all duration-200 p-0 rounded-lg border-2 w-full`,
                  isMarked &&
                    "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-600 md:scale-95 shadow-md",
                  isClickable &&
                    "md:hover:scale-105 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer md:active:scale-95 border-emerald-300",
                  !isMyBoard && "cursor-default opacity-60",
                  !isClickable &&
                    isMyBoard &&
                    !isMarked &&
                    "cursor-default opacity-80 border-slate-200 hover:scale-100",
                )}
              >
                {number}
              </Button>
            )
          })}
        </div>

        {/* Status Messages */}
        {isMyTurn && gameStatus === "playing" && (
          <p className="text-xs sm:text-sm text-center text-white font-semibold mt-4 sm:mt-5 bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 px-3 sm:px-4 rounded-lg shadow-md">
            ✨ Your turn! Click a number
          </p>
        )}

        {!isMyTurn && gameStatus === "playing" && (
          <p className="text-xs sm:text-sm text-center text-slate-600 mt-4 sm:mt-5 bg-slate-100 py-2.5 px-3 sm:px-4 rounded-lg">
            ⏳ Waiting for opponent...
          </p>
        )}
      </CardContent>
    </Card>
  )
}
