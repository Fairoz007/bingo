"use client"

import { useEffect, useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import type { GameState, Room, Player } from "@/lib/types"
import { BingoBoard } from "@/components/bingo-board"
import { GameHeader } from "@/components/game-header"
import { WaitingScreen } from "@/components/waiting-screen"
import { WinModal } from "@/components/win-modal"
import { BoardConfiguration } from "@/components/board-configuration"
import { Card } from "@/components/ui/card"

interface GameRoomClientProps {
  initialRoom: Room
  initialPlayers: Player[]
  roomCode: string
  currentPlayer: string
}

export function GameRoomClient({ initialRoom, initialPlayers, roomCode, currentPlayer }: GameRoomClientProps) {
  // Cast string ID to Convex ID - assumption: initialRoom.id matches Convex ID pattern or we use it as placeholder
  const roomId = initialRoom.id as Id<"rooms">

  const room = useQuery(api.rooms.getByCode, { roomCode })
  const players = useQuery(api.rooms.getPlayers, { roomId: room?._id ?? roomId })

  const currentRoom = room ? ({ ...room, id: room._id } as unknown as Room) : initialRoom
  // Stabilize reference to currentPlayers
  const currentPlayers = useMemo(() => {
    if (!players) return initialPlayers;

    // Sort players to ensure consistent order, if possible. Or just map.
    // players from Convex are already sorted by join_order in getPlayers.
    // However, map returns new array.
    return players.map((p) => ({ ...p, id: p._id })) as unknown as Player[];
  }, [players, initialPlayers])

  const gameState: GameState = useMemo(() => ({
    room: currentRoom,
    players: currentPlayers,
  }), [currentRoom, currentPlayers])

  const [boardConfigured, setBoardConfigured] = useState(false)
  const [isMarkingCell, setIsMarkingCell] = useState(false)
  const [calledNumbers, setCalledNumbers] = useState<number[]>([])

  const configureBoard = useMutation(api.game.configureBoard)
  const rematch = useMutation(api.game.rematch)

  useEffect(() => {
    const allMarkedPositions = new Set<number>()
    const allNumbers: number[] = []

    gameState.players.forEach((player) => {
      const board = player.board as number[]
      const marked = player.marked_positions as number[]

      marked.forEach((pos) => {
        const number = board[pos]
        if (number && !allMarkedPositions.has(number)) {
          allMarkedPositions.add(number)
          allNumbers.push(number)
        }
      })
    })

    setCalledNumbers(allNumbers.sort((a, b) => a - b))
  }, [gameState.players])

  useEffect(() => {
    const gridSize = gameState.room.grid_size || 5
    const expectedBoardSize = gridSize * gridSize
    const myPlayer = gameState.players.find((p) => p.player_number === currentPlayer)

    if (myPlayer && Array.isArray(myPlayer.board) && myPlayer.board.length === expectedBoardSize) {
      setBoardConfigured(true)
    }
  }, [gameState.players, currentPlayer, gameState.room.grid_size])

  const handleBoardConfigured = async (board: number[]) => {
    try {
      await configureBoard({
        roomId: gameState.room.id as Id<"rooms">,
        playerNumber: currentPlayer,
        board,
      })

      setBoardConfigured(true)
    } catch (error: any) {
      console.error("[v0] Error configuring board:", error)
      alert("Failed to configure board. Please try again.")
    }
  }

  const handleRematch = async (reconfigureBoard: boolean) => {
    try {
      console.log("[v0] Starting rematch for room:", gameState.room.id, "reconfigureBoard:", reconfigureBoard)
      await rematch({
        roomId: gameState.room.id as Id<"rooms">,
        reconfigureBoard
      })

      console.log("[v0] Rematch successful")
      setCalledNumbers([])
      setIsMarkingCell(false)

      if (reconfigureBoard) {
        setBoardConfigured(false)
      }
    } catch (error: any) {
      console.error("[v0] Error starting rematch:", error)
      alert(`Failed to start rematch: ${error.message || "Please try again."}`)
    }
  }

  if (!boardConfigured) {
    const myPlayer = gameState.players.find((p) => p.player_number === currentPlayer)
    return (
      <BoardConfiguration
        roomCode={roomCode}
        player={myPlayer}
        gridSize={gameState.room.grid_size || 5}
        totalNumbers={gameState.room.total_numbers || 25}
        players={gameState.players}
        maxPlayers={gameState.room.max_players}
        onBoardConfigured={handleBoardConfigured}
      />
    )
  }

  if (gameState.room.status === "waiting") {
    const myPlayer = gameState.players.find((p) => p.player_number === currentPlayer)
    return (
      <WaitingScreen
        room={gameState.room}
        players={gameState.players}
        currentPlayerName={myPlayer?.player_name || "Player"}
      />
    )
  }

  const myPlayer = gameState.players.find((p) => p.player_number === currentPlayer)
  const sortedPlayers = [...gameState.players].sort((a, b) => a.join_order - b.join_order)

  if (!myPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 p-4">
        <Card className="p-6 sm:p-8 max-w-md border-0 shadow-lg">
          <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-2">Player Not Found</h2>
          <p className="text-slate-600">Unable to find your player data.</p>
        </Card>
      </div>
    )
  }

  const showWinModal = gameState.room.status === "finished" && gameState.room.winner
  const didIWin = gameState.room.winner === currentPlayer
  const winnerPlayer = gameState.players.find((p) => p.player_number === gameState.room.winner)
  const winnerName = winnerPlayer?.player_name || "Unknown"

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 p-2 sm:p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
        <GameHeader
          roomCode={roomCode}
          currentTurn={gameState.room.current_turn}
          myPlayerNumber={currentPlayer}
          winner={gameState.room.winner}
          status={gameState.room.status}
          calledNumbers={calledNumbers}
          allPlayers={sortedPlayers}
          gridSize={gameState.room.grid_size || 5}
          playerCount={gameState.players.length}
        />

        <div className="flex justify-center px-2 sm:px-0">
          <BingoBoard
            player={myPlayer}
            isMyBoard={true}
            isMyTurn={gameState.room.current_turn === currentPlayer}
            roomId={gameState.room.id}
            gameStatus={gameState.room.status}
            gridSize={gameState.room.grid_size || 5}
            playerCount={gameState.players.length}
            isMarkingCell={isMarkingCell}
            setIsMarkingCell={setIsMarkingCell}
            winner={gameState.room.winner}
          />
        </div>
      </div>

      {showWinModal && (
        <WinModal
          didIWin={didIWin}
          winnerName={winnerName}
          roomId={gameState.room.id}
          playerNumber={currentPlayer}
          onRematch={handleRematch}
          gridSize={gameState.room.grid_size || 5}
        />
      )}
      {/* Mobile sticky bottom bar for controls/info */}
      <div className="fixed bottom-0 inset-x-0 md:hidden bg-white/90 backdrop-blur border-t border-emerald-200 p-3 shadow-lg z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-emerald-900">Room: {roomCode}</div>
          <div className="text-xs font-medium text-slate-700">
            {gameState.room.status === "finished"
              ? `${winnerName} Won`
              : gameState.room.current_turn === currentPlayer
                ? "Your Turn"
                : `${sortedPlayers.find((p) => p.player_number === gameState.room.current_turn)?.player_name || "..."}'s Turn`}
          </div>
        </div>
      </div>
    </div>
  )
}
