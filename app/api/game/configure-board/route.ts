import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateBoardNumber } from "@/lib/game-utils"

export async function POST(request: NextRequest) {
  try {
    const { roomId, playerNumber, board } = await request.json()

    // Validate input
    if (!roomId || !playerNumber || !board || !Array.isArray(board)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("grid_size, total_numbers, max_players")
      .eq("id", roomId)
      .single()

    if (roomError || !room) {
      console.error("[v0] Error fetching room:", roomError)
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const { grid_size, total_numbers, max_players } = room
    const expectedBoardSize = grid_size * grid_size

    console.log("[v0] Room config:", { grid_size, total_numbers, max_players, expectedBoardSize })

    if (board.length !== expectedBoardSize) {
      return NextResponse.json(
        { error: `Board must have exactly ${expectedBoardSize} numbers (${grid_size}x${grid_size} grid)` },
        { status: 400 },
      )
    }

    if (!board.every((num) => validateBoardNumber(num, total_numbers))) {
      return NextResponse.json({ error: `All numbers must be between 1 and ${total_numbers}` }, { status: 400 })
    }

    // Update player's board
    const { error: updateError } = await supabase
      .from("players")
      .update({ board })
      .eq("room_id", roomId)
      .eq("player_number", playerNumber)

    if (updateError) {
      console.error("[v0] Error updating board:", updateError)
      return NextResponse.json({ error: "Failed to update board" }, { status: 500 })
    }

    const { data: players, error: playersError } = await supabase.from("players").select("board").eq("room_id", roomId)

    if (playersError || !players) {
      return NextResponse.json({ error: "Failed to check players" }, { status: 500 })
    }

    console.log("[v0] Players configured:", players.length, "of", max_players)

    if (
      players.length === max_players &&
      players.every((p) => p.board && Array.isArray(p.board) && p.board.length === expectedBoardSize)
    ) {
      console.log("[v0] All players ready, starting game")
      const { error: startError } = await supabase
        .from("rooms")
        .update({
          status: "playing",
          current_turn: "player1",
        })
        .eq("id", roomId)

      if (startError) {
        console.error("[v0] Error starting game:", startError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Configure board error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
