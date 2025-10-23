"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { generateBingoBoard } from "@/lib/game-utils"
import { Shuffle, Sparkles, Play } from "lucide-react"

interface BoardConfigurationProps {
  roomCode: string
  playerName: string
  gridSize: number
  totalNumbers: number
  onBoardConfigured: (board: number[]) => void
}

export function BoardConfiguration({
  roomCode,
  playerName,
  gridSize,
  totalNumbers,
  onBoardConfigured,
}: BoardConfigurationProps) {
  const boardSize = gridSize * gridSize
  const [board, setBoard] = useState<(number | null)[]>(Array(boardSize).fill(null))
  const [errors, setErrors] = useState<Set<number>>(new Set())
  const [isRandomizing, setIsRandomizing] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 p-3 sm:p-4 flex items-center justify-center">
      <Card className="p-4 sm:p-6 md:p-8 max-w-4xl w-full space-y-4 sm:space-y-6 shadow-xl bg-white">
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900">Configure Your Board</h1>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Welcome, <span className="font-semibold text-foreground">{playerName}</span>!
            </p>
            <p className="text-sm sm:text-base text-muted-foreground">
              Room: <span className="font-mono font-bold text-base sm:text-lg text-blue-600">{roomCode}</span>
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Grid Size:{" "}
              <span className="font-bold text-blue-600">
                {gridSize}×{gridSize}
              </span>
            </p>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto px-2">
            Enter unique numbers from 1-{totalNumbers} in each cell, or click the button below to generate random
            numbers
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-blue-600">
              {filledCount}/{boardSize} cells filled
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${(filledCount / boardSize) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center px-2">
          <Button
            onClick={handleRandomize}
            disabled={isRandomizing}
            size="lg"
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto text-sm sm:text-base h-12 sm:h-auto"
          >
            <Shuffle className={`w-4 h-4 sm:w-5 sm:h-5 ${isRandomizing ? "animate-spin" : ""}`} />
            {isRandomizing ? "Generating..." : "Generate Random Numbers"}
          </Button>
        </div>

        <div
          className="gap-1.5 sm:gap-2 md:gap-3 max-w-3xl mx-auto px-2"
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
              className={`text-center text-sm sm:text-base md:text-lg font-bold h-10 sm:h-12 md:h-14 transition-all duration-200 ${
                errors.has(index)
                  ? "border-2 border-red-500 bg-red-50"
                  : num !== null
                    ? "border-2 border-green-500 bg-green-50"
                    : "border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500"
              }`}
              placeholder={(index + 1).toString()}
            />
          ))}
        </div>

        {errors.size > 0 && (
          <p className="text-sm text-red-600 text-center">
            Please fix invalid or duplicate numbers (must be unique and between 1-{totalNumbers})
          </p>
        )}

        <div className="flex justify-center pt-2 px-2">
          <Button
            onClick={handleSubmit}
            disabled={!isComplete}
            size="lg"
            className="w-full max-w-md gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg h-12 sm:h-14"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            {isComplete ? "Start Game" : `Fill ${boardSize - filledCount} more cells`}
          </Button>
        </div>
      </Card>
    </div>
  )
}
