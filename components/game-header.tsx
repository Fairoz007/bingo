import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Clock } from "lucide-react"
import type { GameStatus, PlayerNumber, Player } from "@/lib/types"
import { getCompletedLinesWithDetails } from "@/lib/game-utils"

interface GameHeaderProps {
  roomCode: string
  currentTurn: PlayerNumber | null
  myPlayerNumber: PlayerNumber
  winner: PlayerNumber | null
  status: GameStatus
  calledNumbers: number[]
  allPlayers: Player[]
}

export function GameHeader({
  roomCode,
  currentTurn,
  myPlayerNumber,
  winner,
  status,
  calledNumbers,
  allPlayers,
}: GameHeaderProps) {
  const isMyTurn = currentTurn === myPlayerNumber
  const didIWin = winner === myPlayerNumber

  const myPlayer = allPlayers.find((p) => p.player_number === myPlayerNumber)
  const myLines = myPlayer
    ? getCompletedLinesWithDetails(myPlayer.marked_positions as number[])
    : { completedCount: 0, bingoLetters: [], lineDetails: [], completedLines: [] }

  const allBingoLetters = ["B", "I", "N", "G", "O"]

  const currentTurnPlayer = allPlayers.find((p) => p.player_number === currentTurn)

  return (
    <Card className="p-3 sm:p-4 md:p-6 shadow-lg border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="bg-primary p-2 sm:p-3 rounded-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Room Code</p>
            <p className="text-base sm:text-lg md:text-xl font-bold tracking-wider">{roomCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {status === "finished" && winner ? (
            <Badge
              variant={didIWin ? "default" : "secondary"}
              className={`text-xs sm:text-sm md:text-base px-3 py-1.5 sm:px-4 sm:py-2 w-full sm:w-auto justify-center ${
                didIWin ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <Trophy className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {didIWin ? "You Won!" : `${allPlayers.find((p) => p.player_number === winner)?.player_name} Won!`}
            </Badge>
          ) : (
            <Badge
              variant={isMyTurn ? "default" : "secondary"}
              className={cn(
                "text-xs sm:text-sm md:text-base px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-300 w-full sm:w-auto justify-center",
              )}
            >
              <Clock className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {isMyTurn ? "Your Turn" : `${currentTurnPlayer?.player_name}'s Turn`}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-2 sm:mb-3 font-medium">Players:</p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {allPlayers.map((player) => {
            const isCurrentPlayer = player.player_number === myPlayerNumber
            const isCurrentTurn = player.player_number === currentTurn
            return (
              <div
                key={player.id}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm",
                  isCurrentTurn ? "bg-primary/10 ring-2 ring-primary" : "bg-muted",
                  isCurrentPlayer && "font-bold",
                )}
              >
                <span className="text-lg sm:text-2xl">{player.player_avatar || "👤"}</span>
                <span className="text-xs sm:text-sm">
                  {player.player_name}
                  {isCurrentPlayer && <span className="ml-1 text-xs text-primary font-bold">(You)</span>}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-2 sm:mb-3 font-medium">
          Your Lines: <span className="text-primary font-bold text-base">{myLines.completedCount}</span> completed
        </p>
        <div className="flex justify-center gap-1.5 sm:gap-2 md:gap-3">
          {allBingoLetters.map((letter) => {
            const completedLine = myLines.completedLines.find((line) => line.letter === letter)
            const isCompleted = !!completedLine

            return (
              <div
                key={letter}
                className={cn(
                  "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg font-bold text-lg sm:text-xl md:text-2xl transition-all duration-300",
                  isCompleted ? "text-white scale-105" : "bg-muted text-muted-foreground",
                )}
                style={
                  isCompleted
                    ? {
                        backgroundColor: completedLine.color,
                      }
                    : undefined
                }
              >
                {letter}
              </div>
            )
          })}
        </div>
        {myLines.completedCount >= 5 && (
          <p className="text-center mt-2 sm:mt-3 text-base sm:text-lg md:text-xl font-bold text-green-600">BINGO!</p>
        )}
      </div>

      {calledNumbers.length > 0 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2 sm:mb-3 font-medium">
            Called Numbers ({calledNumbers.length}):
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-24 sm:max-h-32 overflow-y-auto">
            {calledNumbers.map((num) => (
              <Badge key={num} variant="secondary" className="text-xs sm:text-sm font-mono px-2 py-1 sm:px-3 sm:py-1.5">
                {num}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
