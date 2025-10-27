"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
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
  const [gameState, setGameState] = useState<GameState>({
    room: initialRoom,
    players: initialPlayers,
  })
  const [boardConfigured, setBoardConfigured] = useState(false)
  const [isMarkingCell, setIsMarkingCell] = useState(false)
  const [calledNumbers, setCalledNumbers] = useState<number[]>([])

  const [supabase] = useState(() => createClient())

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
    console.log("[v0] Setting up real-time subscriptions for room:", roomCode, "roomId:", initialRoom.id)

    const roomChannel = supabase
      .channel(`room-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${initialRoom.id}`,
        },
        (payload) => {
          console.log("[v0] Room update received:", payload)
          if (payload.new) {
            setGameState((prev) => ({
              ...prev,
              room: payload.new as Room,
            }))
          }
        },
      )
      .subscribe((status, err) => {
        console.log("[v0] Room subscription status:", status)
        if (err) console.error("[v0] Room subscription error:", err)
      })

    const playersChannel = supabase
      .channel(`players-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${initialRoom.id}`,
        },
        (payload) => {
          console.log("[v0] Player update received:", payload)

          if (payload.eventType === "UPDATE" && payload.new) {
            setGameState((prev) => {
              const updatedPlayer = payload.new as Player
              const updatedPlayers = prev.players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
              console.log("[v0] Updated players state:", updatedPlayers)
              return {
                ...prev,
                players: updatedPlayers,
              }
            })
          } else if (payload.eventType === "INSERT" && payload.new) {
            setGameState((prev) => {
              const newPlayer = payload.new as Player
              const playerExists = prev.players.some((p) => p.id === newPlayer.id)
              if (playerExists) return prev

              console.log("[v0] New player joined:", newPlayer)
              return {
                ...prev,
                players: [...prev.players, newPlayer],
              }
            })
          }
        },
      )
      .subscribe((status, err) => {
        console.log("[v0] Players subscription status:", status)
        if (err) console.error("[v0] Players subscription error:", err)
      })

    return () => {
      console.log("[v0] Cleaning up subscriptions")
      supabase.removeChannel(roomChannel)
      supabase.removeChannel(playersChannel)
    }
  }, [roomCode, initialRoom.id, supabase])

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
      const response = await fetch("/api/game/configure-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: gameState.room.id,
          playerNumber: currentPlayer,
          board,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to configure board")
      }

      setBoardConfigured(true)
    } catch (error) {
      console.error("[v0] Error configuring board:", error)
      alert("Failed to configure board. Please try again.")
    }
  }

  const handleRematch = async (reconfigureBoard: boolean) => {
    try {
      console.log("[v0] Starting rematch for room:", gameState.room.id, "reconfigureBoard:", reconfigureBoard)
      const response = await fetch("/api/game/rematch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: gameState.room.id, reconfigureBoard }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("[v0] Rematch failed:", errorData)
        throw new Error(errorData.error || "Failed to start rematch")
      }

      console.log("[v0] Rematch successful")
      setCalledNumbers([])
      setIsMarkingCell(false)

      if (reconfigureBoard) {
        setBoardConfigured(false)
      }
    } catch (error) {
      console.error("[v0] Error starting rematch:", error)
      alert(`Failed to start rematch: ${error instanceof Error ? error.message : "Please try again."}`)
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
