import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Rematch request received")
    const { roomId, reconfigureBoard } = await request.json()

    if (!roomId) {
      console.error("[v0] Room ID is missing")
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    console.log("[v0] Starting rematch for room:", roomId, "reconfigureBoard:", reconfigureBoard)
    const supabase = await createClient()

    const { error: roomError } = await supabase
      .from("rooms")
      .update({
        status: reconfigureBoard ? "waiting" : "playing",
        current_turn: "player1",
        winner: null,
      })
      .eq("id", roomId)

    if (roomError) {
      console.error("[v0] Error resetting room:", roomError)
      return NextResponse.json({ error: "Failed to reset room" }, { status: 500 })
    }

    console.log("[v0] Room reset successful")

    const updateData = reconfigureBoard
      ? {
          marked_positions: [],
          board: [],
        }
      : {
          marked_positions: [],
        }

    const { error: playersError } = await supabase.from("players").update(updateData).eq("room_id", roomId)

    if (playersError) {
      console.error("[v0] Error resetting players:", playersError)
      return NextResponse.json({ error: "Failed to reset players" }, { status: 500 })
    }

    console.log("[v0] Players reset successful")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Rematch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
