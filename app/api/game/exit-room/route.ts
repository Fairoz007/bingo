import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { roomId, playerNumber } = await request.json()

    if (!roomId || !playerNumber) {
      return NextResponse.json({ error: "Room ID and player number are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Delete the player
    const { error: deleteError } = await supabase
      .from("players")
      .delete()
      .eq("room_id", roomId)
      .eq("player_number", playerNumber)

    if (deleteError) {
      console.error("[v0] Error deleting player:", deleteError)
      return NextResponse.json({ error: "Failed to exit room" }, { status: 500 })
    }

    // Check remaining players
    const { data: remainingPlayers, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)

    if (playersError) {
      console.error("[v0] Error fetching remaining players:", playersError)
      return NextResponse.json({ error: "Failed to check remaining players" }, { status: 500 })
    }

    // If no players left, delete the room
    if (!remainingPlayers || remainingPlayers.length === 0) {
      await supabase.from("rooms").delete().eq("id", roomId)
    } else {
      // Update player count
      await supabase.from("rooms").update({ player_count: remainingPlayers.length }).eq("id", roomId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Exit room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
