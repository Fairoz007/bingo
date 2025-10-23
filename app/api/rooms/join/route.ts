import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { roomCode, playerName, playerAvatar } = await request.json()

    if (!roomCode || !playerName) {
      return NextResponse.json({ error: "Room code and player name are required" }, { status: 400 })
    }

    if (!playerName.trim()) {
      return NextResponse.json({ error: "Player name cannot be empty" }, { status: 400 })
    }

    const supabase = await createClient()

    const normalizedRoomCode = roomCode.trim().toUpperCase()

    if (normalizedRoomCode.length !== 6) {
      return NextResponse.json({ error: "Room code must be 6 characters" }, { status: 400 })
    }

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

    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Game already started" }, { status: 400 })
    }

    const { data: existingPlayers, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", room.id)
      .order("join_order", { ascending: true })

    if (playersError) {
      console.error("Players lookup error:", playersError)
      return NextResponse.json({ error: "Failed to check room capacity" }, { status: 500 })
    }

    const maxPlayers = room.max_players || 2
    console.log("[v0] Room capacity check:", {
      roomCode: normalizedRoomCode,
      currentPlayers: existingPlayers.length,
      maxPlayers: maxPlayers,
      isFull: existingPlayers.length >= maxPlayers,
    })

    if (existingPlayers.length >= maxPlayers) {
      return NextResponse.json(
        {
          error: `Room is full (${existingPlayers.length}/${maxPlayers} players)`,
        },
        { status: 400 },
      )
    }

    const nextPlayerNumber = `player${existingPlayers.length + 1}`
    const nextJoinOrder = existingPlayers.length + 1

    const { error: playerError } = await supabase.from("players").insert({
      room_id: room.id,
      player_number: nextPlayerNumber,
      player_name: playerName.trim(),
      player_avatar: playerAvatar || "👤",
      join_order: nextJoinOrder,
      board: [],
      marked_positions: [],
    })

    if (playerError) {
      console.error("Player creation error:", playerError)
      return NextResponse.json({ error: "Failed to join room" }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from("rooms")
      .update({ player_count: nextJoinOrder })
      .eq("id", room.id)

    if (updateError) {
      console.error("Room update error:", updateError)
    }

    if (nextJoinOrder === maxPlayers) {
      console.log("[v0] All players joined, starting game")
      await supabase
        .from("rooms")
        .update({
          status: "playing",
          current_turn: "player1",
        })
        .eq("id", room.id)
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
