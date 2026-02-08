import { redirect } from "next/navigation"
import { GameRoomClient } from "@/components/game-room-client"
import { Card } from "@/components/ui/card"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: { roomCode: string }
  searchParams: { player?: string }
}) {
  const { roomCode } = params
  const { player } = searchParams

  const normalizedRoomCode = roomCode.toUpperCase()
  const currentPlayerParam = player?.toLowerCase()

  if (!currentPlayerParam || !/^player\d+$/.test(currentPlayerParam)) {
    redirect("/")
  }

  const currentPlayer = currentPlayerParam as string

  // Fetch room
  const room = await convex.query(api.rooms.getByCode, { roomCode: normalizedRoomCode })

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold text-destructive mb-2">Room Not Found</h2>
          <p className="text-muted-foreground">The room code "{normalizedRoomCode}" does not exist.</p>
        </Card>
      </div>
    )
  }

  // Fetch players
  const players = await convex.query(api.rooms.getPlayers, { roomId: room._id })

  const playerList = players || []
  const isKnownPlayer = playerList.some((player: any) => player.player_number?.toLowerCase() === currentPlayer)

  if (!isKnownPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="p-8 max-w-md text-center space-y-3">
          <h2 className="text-xl font-bold text-destructive">Player Not Recognized</h2>
          <p className="text-muted-foreground">
            We couldn't find your player in room "{normalizedRoomCode}". Please rejoin the room from the home page.
          </p>
        </Card>
      </div>
    )
  }

  // Transform to match props interface where 'id' is expected
  // We cast to any to satisfy TS for now, assuming GameRoomClient will handle the types or we update types
  const roomWithId = { ...room, id: room._id }
  const playersWithId = playerList.map((p: any) => ({ ...p, id: p._id }))

  return (
    <GameRoomClient
      initialRoom={roomWithId as any}
      initialPlayers={playersWithId as any}
      roomCode={normalizedRoomCode}
      currentPlayer={currentPlayer}
    />
  )
}
