import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateRoomCode, calculateGridSize } from "@/lib/game-utils"

export async function POST(request: NextRequest) {
  try {
    const { playerName, playerAvatar, maxPlayers } = await request.json()

    if (!playerName || !playerName.trim()) {
      return NextResponse.json({ error: "Player name is required" }, { status: 400 })
    }

    const numPlayers = maxPlayers && !isNaN(maxPlayers) ? Number(maxPlayers) : 2
    if (numPlayers < 2 || numPlayers > 6) {
      return NextResponse.json({ error: "Number of players must be between 2 and 6" }, { status: 400 })
    }

    const { gridSize, totalNumbers } = calculateGridSize(numPlayers)
    console.log(
      "[v0] Creating room with max_players:",
      numPlayers,
      "grid_size:",
      gridSize,
      "total_numbers:",
      totalNumbers,
    )

    const supabase = await createClient()

    let roomCode = generateRoomCode()
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const { data: existingRoom } = await supabase.from("rooms").select("id").eq("room_code", roomCode).maybeSingle()

      if (!existingRoom) break

      roomCode = generateRoomCode()
      attempts++
    }

    if (attempts === maxAttempts) {
      return NextResponse.json({ error: "Failed to generate unique room code" }, { status: 500 })
    }

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        room_code: roomCode,
        status: "waiting",
        current_turn: null,
        winner: null,
        max_players: numPlayers,
        player_count: 1,
        grid_size: gridSize,
        total_numbers: totalNumbers,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (roomError) {
      console.error("Room creation error:", roomError)
      return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
    }

    console.log("[v0] Room created:", { roomCode, maxPlayers: room.max_players })

    const { error: playerError } = await supabase.from("players").insert({
      room_id: room.id,
      player_number: "player1",
      player_name: playerName.trim(),
      player_avatar: playerAvatar || "👤",
      join_order: 1,
      board: [],
      marked_positions: [],
    })

    if (playerError) {
      console.error("Player creation error:", playerError)
      return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
    }

    return NextResponse.json({ roomCode, roomId: room.id })
  } catch (error) {
    console.error("Create room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
