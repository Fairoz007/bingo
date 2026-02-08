"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { generateBingoBoard } from "@/lib/game-utils"
import { Shuffle, Play, RotateCcw } from "lucide-react"
import { BoardConfigHeader } from "@/components/board-config-header"
import { BoardConfigPlayerPanel } from "@/components/board-config-player-panel"
import { Progress } from "@/components/ui/progress"

import type { Player } from "@/lib/types"

interface BoardConfigurationProps {
  roomCode: string
  player: Player | undefined
  gridSize: number
  totalNumbers: number
  players: Player[]
  maxPlayers: number
  onBoardConfigured: (board: number[]) => void
  isSubmitting?: boolean
}

export function BoardConfiguration({
  roomCode,
  player,
  gridSize,
  totalNumbers,
  players,
  maxPlayers,
  onBoardConfigured,
  isSubmitting = false,
}: BoardConfigurationProps) {
  const boardSize = gridSize * gridSize
  const [board, setBoard] = useState<(number | null)[]>(Array(boardSize).fill(null))
  const [errors, setErrors] = useState<Set<number>>(new Set())
  const [isRandomizing, setIsRandomizing] = useState(false)

  const playerName = player?.player_name || "Player"
  const playerJoinOrder = player?.join_order ?? players.length + 1
  const playersReady = players.filter(
    (p) => Array.isArray(p.board) && p.board.length === boardSize,
  ).length

  const handleCellChange = (index: number, value: string) => {
    const num = value === "" ? null : Number.parseInt(value, 10)
    const newBoard = [...board]
    newBoard[index] = num

    const newErrors = new Set(errors)
    if (num !== null) {
      if (num < 1 || num > totalNumbers) {
        newErrors.add(index)
      } else {
        const duplicateIndex = newBoard.findIndex((n, i) => i !== index && n === num)
        if (duplicateIndex !== -1) {
          newErrors.add(index)
        } else {
          newErrors.delete(index)
        }
      }
    } else {
      newErrors.delete(index)
    }

    setBoard(newBoard)
    setErrors(newErrors)
  }

  const handleRandomize = () => {
    setIsRandomizing(true)
    setTimeout(() => {
      const randomBoard = generateBingoBoard(gridSize, totalNumbers)
      setBoard(randomBoard)
      setErrors(new Set())
      setIsRandomizing(false)
    }, 300)
  }

  const handleClearBoard = () => {
    setBoard(Array(boardSize).fill(null))
    setErrors(new Set())
  }

  const handleSubmit = () => {
    if (board.some((num) => num === null)) {
      alert(`Please fill all cells with numbers 1-${totalNumbers}`)
      return
    }

    if (errors.size > 0) {
      alert(`Please fix invalid numbers (must be unique and between 1-${totalNumbers})`)
      return
    }

    const uniqueNumbers = new Set(board)
    if (uniqueNumbers.size !== boardSize) {
      alert("All numbers must be unique!")
      return
    }

    onBoardConfigured(board as number[])
  }

  const isComplete = board.every((num) => num !== null) && errors.size === 0
  const filledCount = board.filter((num) => num !== null).length
  const progressPercent = (filledCount / boardSize) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
      <BoardConfigHeader roomCode={roomCode} playerName={playerName} />

      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-4 md:p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Left Sidebar: Player Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <BoardConfigPlayerPanel
                playerName={playerName}
                playerNumber={playerJoinOrder}
                playerCount={players.length}
                playersReady={playersReady}
                maxPlayers={maxPlayers}
                gridSize={gridSize}
                totalNumbers={totalNumbers}
              />
            </div>
          </div>

          {/* Main Content: Board Configuration */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* Title Section */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Configure Your Personal Bingo Card</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Enter unique numbers from 1-{totalNumbers} in each cell to create your bingo card.
                Other players will configure their own boards separately.
              </p>
            </div>

            {/* Progress Section */}
            <Card className="bg-white border-emerald-200 p-4 md:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-900">Board Progress</span>
                <span className="text-sm font-bold text-emerald-600">
                  {filledCount}/{boardSize} cells
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {isComplete
                  ? "✓ Board complete! Ready to start."
                  : `Fill ${boardSize - filledCount} more cell${boardSize - filledCount !== 1 ? "s" : ""} to continue.`}
              </p>
            </Card>

            {/* Grid Section */}
            <Card className="bg-white border-emerald-200 p-4 md:p-6">
              <div
                className="gap-2 md:gap-3"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                }}
              >
                {board.map((num, index) => (
                  <Input
                    key={index}
                    type="number"
                    min="1"
                    max={totalNumbers}
                    value={num ?? ""}
                    onChange={(e) => handleCellChange(index, e.target.value)}
                    disabled={isSubmitting}
                    className={`text-center text-base md:text-lg font-bold h-12 md:h-14 transition-all duration-200 rounded-lg ${errors.has(index)
                        ? "border-2 border-red-500 bg-red-50 focus:border-red-600"
                        : num !== null
                          ? "border-2 border-emerald-500 bg-emerald-50 focus:border-emerald-600"
                          : "border-2 border-gray-300 hover:border-emerald-400 focus:border-emerald-500 focus:bg-emerald-50"
                      }`}
                    placeholder="—"
                  />
                ))}
              </div>

              {/* Error Message */}
              {errors.size > 0 && (
                <p className="text-sm text-red-600 text-center mt-4 bg-red-50 p-3 rounded-lg">
                  ⚠ Please fix invalid or duplicate numbers (must be unique and between 1-{totalNumbers})
                </p>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleRandomize}
                disabled={isRandomizing || isSubmitting}
                variant="outline"
                size="lg"
                className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-12 bg-transparent"
              >
                <Shuffle className={`w-5 h-5 ${isRandomizing ? "animate-spin" : ""}`} />
                {isRandomizing ? "Generating..." : "Generate Random"}
              </Button>

              <Button
                onClick={handleClearBoard}
                disabled={isSubmitting}
                variant="outline"
                size="lg"
                className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 h-12 bg-transparent"
              >
                <RotateCcw className="w-5 h-5" />
                Clear Board
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!isComplete || isSubmitting}
                size="lg"
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-12"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {isComplete ? "Ready to Play" : `Fill ${boardSize - filledCount} more`}
                  </>
                )}
              </Button>
            </div>

            {/* Footer Info */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 p-4">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">💡 Tip:</span> Click "Generate Random" to quickly fill your board with
                random numbers, or manually enter numbers for a custom board.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
