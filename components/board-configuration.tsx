"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { generateBingoBoard } from "@/lib/game-utils"
import { Shuffle, Play, RotateCcw, Check, AlertCircle } from "lucide-react"
import { BoardConfigHeader } from "@/components/board-config-header"
import { BoardConfigPlayerPanel } from "@/components/board-config-player-panel"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

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
          newErrors.add(duplicateIndex)
        } else {
          newErrors.delete(index)
          // Re-check if the previously duplicated number is now unique
          // This is a simple check; for full correctness we might re-validate all, but this suffices for UX
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col font-sans">
      <BoardConfigHeader roomCode={roomCode} playerName={playerName} />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Left Sidebar: Player Panel */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
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
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-6 rounded-[24px] border border-white/50 shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Setup Your Board</h1>
                <p className="text-slate-500 text-sm mt-1">Fill the grid with unique numbers (1-{totalNumbers})</p>
              </div>

              <div className="flex-1 max-w-sm w-full space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-slate-400">
                  <span>Progress</span>
                  <span className={isComplete ? "text-emerald-600" : "text-slate-600"}>{filledCount} / {boardSize}</span>
                </div>
                <Progress value={progressPercent} className="h-2.5 rounded-full bg-slate-100" indicatorClassName={isComplete ? "bg-emerald-500" : "bg-blue-500"} />
              </div>
            </div>

            {/* Grid Section */}
            <Card className="bg-white/90 backdrop-blur-xl border-white/60 shadow-xl rounded-[32px] overflow-hidden ring-1 ring-black/5">
              <div className="p-8">
                <div
                  className={cn(
                    "grid gap-3 md:gap-4 mx-auto max-w-2xl",
                    gridSize === 5 ? "grid-cols-5" : "grid-cols-4" // Simple check, though dynamic style is better for variable sizes
                  )}
                  style={{
                    // Fallback for dynamic grid sizes if needed, but Tailwind classes are preferred for spacing
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  }}
                >
                  {board.map((num, index) => {
                    const isError = errors.has(index);
                    const isFilled = num !== null;

                    return (
                      <div key={index} className="relative aspect-square">
                        <Input
                          type="number"
                          min="1"
                          max={totalNumbers}
                          value={num ?? ""}
                          onChange={(e) => handleCellChange(index, e.target.value)}
                          disabled={isSubmitting}
                          className={cn(
                            "w-full h-full text-center text-xl md:text-2xl font-bold transition-all duration-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-opacity-50 z-10 relative",
                            isError
                              ? "border-red-300 bg-red-50 text-red-600 focus:border-red-500 focus:ring-red-200"
                              : isFilled
                                ? "border-transparent bg-emerald-500 text-white focus:ring-emerald-300 shadow-md transform hover:-translate-y-0.5"
                                : "border-slate-200 bg-white hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100 text-slate-700"
                          )}
                          placeholder=""
                        />
                        {/* Number label for empty state opacity mostly */}
                        {!isFilled && !isError && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                            <span className="text-2xl font-black text-slate-400">#</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Error Message */}
                {errors.size > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Please ensure all numbers are unique and between 1-{totalNumbers}</span>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    onClick={handleRandomize}
                    disabled={isRandomizing || isSubmitting}
                    variant="outline"
                    className="flex-1 sm:flex-none h-11 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl font-bold transition-all"
                  >
                    <Shuffle className={cn("w-4 h-4 mr-2", isRandomizing && "animate-spin")} />
                    Randomize
                  </Button>
                  <Button
                    onClick={handleClearBoard}
                    disabled={isSubmitting}
                    variant="ghost"
                    className="flex-1 sm:flex-none h-11 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!isComplete || isSubmitting}
                  className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      {isComplete ? (
                        <>
                          Ready to Play <Play className="w-4 h-4 ml-2 fill-current" />
                        </>
                      ) : (
                        `Fill ${boardSize - filledCount} more`
                      )}
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Tip */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start text-amber-800/80 text-sm max-w-2xl mx-auto">
              <span className="text-xl">💡</span>
              <p className="mt-0.5">
                <strong>Pro Tip:</strong> Use the "Randomize" button to instantly generate a valid board, then make manual adjustments if you have lucky numbers!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
