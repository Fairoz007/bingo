import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GameRoomClient } from "@/components/game-room-client"
import { Card } from "@/components/ui/card"

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: { roomCode: string }
  searchParams: { player?: string }
}) {
  const roomCode = params.roomCode.toUpperCase()
  const currentPlayer = searchParams.player as "player1" | "player2" | undefined

  if (!currentPlayer || (currentPlayer !== "player1" && currentPlayer !== "player2")) {
    redirect("/")
  }

  const supabase = await createClient()

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("room_code", roomCode)
    .maybeSingle()

  if (roomError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Room</h2>
          <p className="text-muted-foreground">Failed to load room data. Please try again.</p>
        </Card>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold text-destructive mb-2">Room Not Found</h2>
          <p className="text-muted-foreground">The room code "{roomCode}" does not exist.</p>
        </Card>
      </div>
    )
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", room.id)
    .order("player_number")

  if (playersError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Players</h2>
          <p className="text-muted-foreground">Failed to load player data. Please try again.</p>
        </Card>
      </div>
    )
  }

  return (
    <GameRoomClient
      initialRoom={room}
      initialPlayers={players || []}
      roomCode={roomCode}
      currentPlayer={currentPlayer}
    />
  )
}
