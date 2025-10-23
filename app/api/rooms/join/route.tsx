import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { roomCode, playerName, playerAvatar } = await request.json()

    if (!roomCode || !playerName || !playerName.trim()) {
      return NextResponse.json({ error: "Room code and player name are required" }, { status: 400 })
    }

    const nameRegex = /^[a-zA-Z0-9\s\-']{1,30}$/
    if (!nameRegex.test(playerName.trim())) {
      return NextResponse.json(
        {
          error: "Player name can only contain letters, numbers, spaces, hyphens, and apostrophes (max 30 characters)",
        },
        { status: 400 },
      )
    }

    const normalizedRoomCode = roomCode.trim().toUpperCase()

    if (normalizedRoomCode.length !== 6) {
      return NextResponse.json({ error: "Room code must be 6 characters" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("room_code", normalizedRoomCode)
      .maybeSingle()

    if (roomError) {
      console.error("Room lookup error:", roomError)
      return NextResponse.json({ error: "Failed to find room" }, { status: 500 })
    }

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.expires_at && new Date(room.expires_at) < new Date()) {
      return NextResponse.json({ error: "Room has expired" }, { status: 410 })
    }

    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Room is not available" }, { status: 400 })
    }

    if (room.player_count >= room.max_players) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 })
    }

    // Get current player count to determine player number
    const { data: existingPlayers, error: playersError } = await supabase
      .from("players")
      .select("player_number")
      .eq("room_id", room.id)

    if (playersError) {
      console.error("Players lookup error:", playersError)
      return NextResponse.json({ error: "Failed to check room capacity" }, { status: 500 })
    }

    const playerCount = existingPlayers?.length || 0
    const nextJoinOrder = playerCount + 1
    const nextPlayerNumber = `player${nextJoinOrder}`

    // Create new player with empty board so they configure it themselves
    const { error: playerError } = await supabase.from("players").insert({
      room_id: room.id,
      player_number: nextPlayerNumber,
      player_name: playerName.trim(),
      player_avatar: playerAvatar || "👤",
      join_order: nextJoinOrder,
      board: Array(9).fill(null),
      marked_positions: [],
    })

    if (playerError) {
      console.error("Player creation error:", playerError)
      return NextResponse.json({ error: "Failed to join room" }, { status: 500 })
    }

    const newPlayerCount = playerCount + 1
    const updateData: Record<string, unknown> = {
      player_count: newPlayerCount,
    }

    if (newPlayerCount >= room.max_players) {
      updateData.status = "playing"
      updateData.current_turn = "player1"
    }

    const { error: updateError } = await supabase.from("rooms").update(updateData).eq("id", room.id)

    if (updateError) {
      console.error("Room update error:", updateError)
      return NextResponse.json({ error: "Failed to start game" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      roomCode: normalizedRoomCode,
      playerNumber: nextPlayerNumber,
    })
  } catch (error) {
    console.error("Join room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
