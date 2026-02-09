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
import { motion, AnimatePresence } from "framer-motion"

interface GameRoomClientProps {
  initialRoom: Room
  initialPlayers: Player[]
  roomCode: string
  currentPlayer: string
}

export function GameRoomClient({ initialRoom, initialPlayers, roomCode, currentPlayer }: GameRoomClientProps) {
  // Cast string ID to Convex ID
  const roomId = initialRoom.id as Id<"rooms">

  const room = useQuery(api.rooms.getByCode, { roomCode })
  const players = useQuery(api.rooms.getPlayers, { roomId: room?._id ?? roomId })

  const currentRoom = room ? ({ ...room, id: room._id } as unknown as Room) : initialRoom

  const currentPlayers = useMemo(() => {
    if (!players) return initialPlayers;
    return players.map((p) => ({ ...p, id: p._id })) as unknown as Player[];
  }, [players, initialPlayers])

  const gameState: GameState = useMemo(() => ({
    room: currentRoom,
    players: currentPlayers,
  }), [currentRoom, currentPlayers])

  const [isConfiguring, setIsConfiguring] = useState(false)
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

  const myPlayer = gameState.players.find((p) => p.player_number === currentPlayer)
  const gridSize = gameState.room.grid_size || 5
  const expectedBoardSize = gridSize * gridSize

  const isBoardConfigured = useMemo(() => {
    return myPlayer && Array.isArray(myPlayer.board) && myPlayer.board.length === expectedBoardSize
  }, [myPlayer, expectedBoardSize])

  const handleBoardConfigured = async (board: number[]) => {
    setIsConfiguring(true)
    try {
      await configureBoard({
        roomId: gameState.room.id as Id<"rooms">,
        playerNumber: currentPlayer,
        board,
      })
      // No need to set state locally, derived state handles it
    } catch (error: any) {
      console.error("[v0] Error configuring board:", error)
      alert("Failed to configure board. Please try again.")
    } finally {
      setIsConfiguring(false)
    }
  }

  const handleRematch = async (reconfigureBoard: boolean) => {
    try {
      await rematch({
        roomId: gameState.room.id as Id<"rooms">,
        reconfigureBoard
      })

      setCalledNumbers([])
      setIsMarkingCell(false)

      // No need to reset board configured state locally, server update will trigger it
    } catch (error: any) {
      console.error("[v0] Error starting rematch:", error)
      alert(`Failed to start rematch: ${error.message || "Please try again."}`)
    }
  }

  if (!isBoardConfigured) {
    return (
      <BoardConfiguration
        roomCode={roomCode}
        player={myPlayer}
        gridSize={gameState.room.grid_size || 5}
        totalNumbers={gameState.room.total_numbers || 25}
        players={gameState.players}
        maxPlayers={gameState.room.max_players}
        onBoardConfigured={handleBoardConfigured}
        isSubmitting={isConfiguring}
      />
    )
  }

  if (gameState.room.status === "waiting") {

    return (
      <WaitingScreen
        room={gameState.room}
        players={gameState.players}
        currentPlayerName={myPlayer?.player_name || "Player"}
      />
    )
  }


  const sortedPlayers = [...gameState.players].sort((a, b) => a.join_order - b.join_order)

  if (!myPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="p-8 max-w-md border-0 shadow-xl bg-white/80 backdrop-blur">
          <h2 className="text-xl font-bold text-red-500 mb-2">Player Not Found</h2>
          <p className="text-slate-600">Unable to find your player data in this room.</p>
        </Card>
      </div>
    )
  }

  const showWinModal = gameState.room.status === "finished" && gameState.room.winner
  const didIWin = gameState.room.winner === currentPlayer
  const winnerPlayer = gameState.players.find((p) => p.player_number === gameState.room.winner)
  const winnerName = winnerPlayer?.player_name || "Unknown"

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 relative selection:bg-emerald-200 font-sans">
      {/* Premium Minimal Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Darker center anchor */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-slate-50/80 mix-blend-overlay" />
        <div className="absolute top-[10%] -left-[10%] w-[50rem] h-[50rem] bg-emerald-100/30 rounded-full blur-[120px] opacity-50 mix-blend-multiply" />
        <div className="absolute bottom-[10%] -right-[10%] w-[50rem] h-[50rem] bg-teal-100/30 rounded-full blur-[120px] opacity-50 mix-blend-multiply" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-screen flex flex-col overflow-y-auto pb-24 md:pb-6 scrollbar-hide"
      >
        <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 space-y-8">
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

          <div className="flex justify-center px-2 sm:px-0 pb-10">
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
              turnExpiresAt={gameState.room.turn_expires_at}
            />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
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
      </AnimatePresence>

      {/* Mobile sticky bottom bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 inset-x-0 md:hidden bg-white/90 backdrop-blur-xl border-t border-emerald-100 p-4 shadow-lg z-40"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Room</span>
            <span className="text-sm font-black text-slate-800 font-mono tracking-widest">{roomCode}</span>
          </div>

          <div className="flex-1 flex justify-end">
            {gameState.room.status === "finished" ? (
              <div className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold">
                Game Over
              </div>
            ) : gameState.room.current_turn === currentPlayer ? (
              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-200 animate-pulse">
                Your Turn
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                {sortedPlayers.find((p) => p.player_number === gameState.room.current_turn)?.player_name || "..."}'s Turn
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
