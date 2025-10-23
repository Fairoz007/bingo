// Generate a random bingo board with numbers based on grid size
export function generateBingoBoard(gridSize = 5, totalNumbers?: number): number[] {
  const maxNumber = totalNumbers || gridSize * gridSize
  const boardSize = gridSize * gridSize
  const numbers: number[] = []
  const usedNumbers = new Set<number>()

  while (numbers.length < boardSize) {
    const num = Math.floor(Math.random() * maxNumber) + 1
    if (!usedNumbers.has(num)) {
      usedNumbers.add(num)
      numbers.push(num)
    }
  }

  return numbers
}

// Generate a unique 6-character room code
export function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Check which BINGO columns (B-I-N-G-O) are completed
export function getCompletedColumns(markedPositions: number[], gridSize = 5): string[] {
  const marked = new Set(markedPositions)
  const completed: string[] = []

  // Define columns based on grid size
  const columns: { [key: string]: number[] } = {}
  for (let i = 0; i < gridSize; i++) {
    columns[String.fromCharCode(66 + i)] = Array.from({ length: gridSize }, (_, j) => i + j * gridSize)
  }

  for (const [letter, positions] of Object.entries(columns)) {
    if (positions.every((pos) => marked.has(pos))) {
      completed.push(letter)
    }
  }

  return completed
}

// Validate if a number is within the bingo board range based on grid size
export function validateBoardNumber(num: number, totalNumbers = 25): boolean {
  return num >= 1 && num <= totalNumbers && Number.isInteger(num)
}

// Get the next player turn
export function getNextPlayerTurn(currentPlayer: string, totalPlayers: number): string {
  // Extract player number (e.g., "player1" -> 1)
  const currentNum = Number.parseInt(currentPlayer.replace("player", ""))

  // Rotate to next player (1 -> 2 -> 3 -> ... -> totalPlayers -> 1)
  const nextNum = currentNum >= totalPlayers ? 1 : currentNum + 1

  return `player${nextNum}`
}

export interface CompletedLineInfo {
  type: "row" | "column" | "diagonal"
  index: number // row/column number (0-4) or diagonal identifier (0 or 1)
  positions: number[] // board positions that make up this line
  color: string // hex color for this line
  letter: string // B, I, N, G, or O
}

// Check completed lines with details based on grid size
export function getCompletedLinesWithDetails(
  markedPositions: number[],
  gridSize = 5,
): {
  completedCount: number
  bingoLetters: string[]
  lineDetails: string[]
  completedLines: CompletedLineInfo[]
} {
  const marked = new Set(markedPositions)
  const completedLines: CompletedLineInfo[] = []
  const lineDetails: string[] = []

  const colors = ["#FF3B30", "#34C759", "#007AFF", "#FFD60A", "#FF9500"]
  const letters = ["B", "I", "N", "G", "O"]

  // Check all rows
  for (let row = 0; row < gridSize; row++) {
    const rowPositions = Array.from({ length: gridSize }, (_, i) => row * gridSize + i)
    if (rowPositions.every((pos) => marked.has(pos))) {
      const lineIndex = completedLines.length
      if (lineIndex < 5) {
        completedLines.push({
          type: "row",
          index: row,
          positions: rowPositions,
          color: colors[lineIndex],
          letter: letters[lineIndex],
        })
        lineDetails.push(`Row ${row + 1}`)
      }
    }
  }

  // Check all columns
  for (let col = 0; col < gridSize; col++) {
    const colPositions = Array.from({ length: gridSize }, (_, i) => col + i * gridSize)
    if (colPositions.every((pos) => marked.has(pos))) {
      const lineIndex = completedLines.length
      if (lineIndex < 5) {
        completedLines.push({
          type: "column",
          index: col,
          positions: colPositions,
          color: colors[lineIndex],
          letter: letters[lineIndex],
        })
        lineDetails.push(`Column ${col + 1}`)
      }
    }
  }

  // Check diagonal (top-left to bottom-right)
  const diagonal1 = Array.from({ length: gridSize }, (_, i) => i * gridSize + i)
  if (diagonal1.every((pos) => marked.has(pos))) {
    const lineIndex = completedLines.length
    if (lineIndex < 5) {
      completedLines.push({
        type: "diagonal",
        index: 0,
        positions: diagonal1,
        color: colors[lineIndex],
        letter: letters[lineIndex],
      })
      lineDetails.push("Diagonal \\")
    }
  }

  // Check diagonal (top-right to bottom-left)
  const diagonal2 = Array.from({ length: gridSize }, (_, i) => i * gridSize + (gridSize - 1 - i))
  if (diagonal2.every((pos) => marked.has(pos))) {
    const lineIndex = completedLines.length
    if (lineIndex < 5) {
      completedLines.push({
        type: "diagonal",
        index: 1,
        positions: diagonal2,
        color: colors[lineIndex],
        letter: letters[lineIndex],
      })
      lineDetails.push("Diagonal /")
    }
  }

  const bingoLetters = completedLines.map((line) => line.letter)

  return {
    completedCount: completedLines.length,
    bingoLetters,
    lineDetails,
    completedLines,
  }
}

// Get completed lines without details based on grid size
export function getCompletedLines(
  markedPositions: number[],
  gridSize = 5,
): {
  completedCount: number
  bingoLetters: string[]
  lineDetails: string[]
} {
  const result = getCompletedLinesWithDetails(markedPositions, gridSize)
  return {
    completedCount: result.completedCount,
    bingoLetters: result.bingoLetters,
    lineDetails: result.lineDetails,
  }
}

// Check if the player has won by completing at least 5 lines based on grid size
export function checkWin(markedPositions: number[], gridSize = 5): boolean {
  const { completedCount } = getCompletedLines(markedPositions, gridSize)
  return completedCount >= 5 // Must complete at least 5 lines (any combination)
}

export function calculateGridSize(playerCount: number): { gridSize: number; totalNumbers: number } {
  const gridSize = playerCount + 3 // 2 players -> 5x5, 3 -> 6x6, etc.
  const totalNumbers = gridSize * gridSize
  return { gridSize, totalNumbers }
}
