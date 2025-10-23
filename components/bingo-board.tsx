"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Player, GameStatus } from "@/lib/types"
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
}: BingoBoardProps) {
  const markedSet = new Set(player.marked_positions)

  const { completedLines } = getCompletedLinesWithDetails(player.marked_positions as number[], gridSize)

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

  const hasWinningLine = player.marked_positions.length >= 5 && gameStatus === "finished"

  return (
    <Card
      className={cn(
        "shadow-lg transition-all duration-300 border w-full max-w-2xl",
        isMyBoard && isMyTurn && gameStatus === "playing" ? "ring-2 ring-primary border-primary" : "border-border",
      )}
    >
      <CardHeader className="pb-3 sm:pb-4 border-b px-3 sm:px-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 sm:p-2 rounded-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <CardTitle className="text-base sm:text-xl font-bold">{player.player_name}</CardTitle>
            {hasWinningLine && <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />}
          </div>
          {isMyBoard ? (
            <span className="text-xs sm:text-sm font-semibold text-primary-foreground bg-primary px-3 py-1 sm:px-4 sm:py-1.5 rounded-full">
              Your Board
            </span>
          ) : (
            <span className="text-xs sm:text-sm font-medium text-muted-foreground bg-muted px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1.5">
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              View Only
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
        <div
          className="gap-1.5 sm:gap-2 md:gap-3"
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
                className={cn(
                  "h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg font-bold transition-all duration-200 p-0 rounded-lg",
                  isMarked && "bg-primary text-primary-foreground scale-95",
                  isClickable && "hover:scale-105 hover:border-primary cursor-pointer active:scale-95",
                  !isMyBoard && "cursor-default opacity-75",
                  !isClickable && isMyBoard && !isMarked && "cursor-default opacity-90 hover:scale-100",
                )}
              >
                {number}
              </Button>
            )
          })}
        </div>

        {isMyBoard && isMyTurn && gameStatus === "playing" && (
          <p className="text-xs sm:text-sm text-center text-primary-foreground font-semibold mt-3 sm:mt-4 bg-primary py-2 px-3 sm:px-4 rounded-lg">
            Your turn! Click a number
          </p>
        )}

        {isMyBoard && !isMyTurn && gameStatus === "playing" && (
          <p className="text-xs sm:text-sm text-center text-muted-foreground mt-3 sm:mt-4 bg-muted py-2 px-3 sm:px-4 rounded-lg">
            Waiting for opponent...
          </p>
        )}
        {!isMyBoard && gameStatus === "playing" && (
          <p className="text-xs sm:text-sm text-center text-muted-foreground mt-3 sm:mt-4 bg-muted py-2 px-3 sm:px-4 rounded-lg">
            Opponent's board (view only)
          </p>
        )}
      </CardContent>
    </Card>
  )
}
