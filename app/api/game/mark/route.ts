import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkWin, getNextPlayerTurn } from "@/lib/game-utils"

export async function POST(request: NextRequest) {
  try {
    const { roomId, playerNumber, position } = await request.json()

    if (!roomId || !playerNumber || position === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: room, error: roomError } = await supabase.from("rooms").select("*").eq("id", roomId).single()

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.current_turn !== playerNumber) {
      return NextResponse.json({ error: "Not your turn" }, { status: 400 })
    }

    if (room.status !== "playing") {
      return NextResponse.json({ error: "Game is not active" }, { status: 400 })
    }

    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .eq("player_number", playerNumber)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    const markedPositions = player.marked_positions as number[]
    if (markedPositions.includes(position)) {
      return NextResponse.json({ error: "Position already marked" }, { status: 400 })
    }

    const board = player.board as number[]
    const selectedNumber = board[position]

    const { data: allPlayers, error: allPlayersError } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .order("join_order", { ascending: true })

    if (allPlayersError || !allPlayers) {
      return NextResponse.json({ error: "Failed to get players" }, { status: 500 })
    }

    for (const p of allPlayers) {
      const playerBoard = p.board as number[]
      const playerMarkedPositions = p.marked_positions as number[]

      const positionOnThisBoard = playerBoard.indexOf(selectedNumber)

      if (positionOnThisBoard !== -1 && !playerMarkedPositions.includes(positionOnThisBoard)) {
        const newMarkedPositions = [...playerMarkedPositions, positionOnThisBoard]

        const { error: updateError } = await supabase
          .from("players")
          .update({ marked_positions: newMarkedPositions })
          .eq("id", p.id)

        if (updateError) {
          console.error("[v0] Update player error:", updateError)
        }

        if (checkWin(newMarkedPositions)) {
          const { error: winError } = await supabase
            .from("rooms")
            .update({
              status: "finished",
              winner: p.player_number,
              current_turn: null,
            })
            .eq("id", roomId)

          if (winError) {
            console.error("[v0] Update winner error:", winError)
          }

          return NextResponse.json({ success: true, won: true, winner: p.player_number })
        }
      }
    }

    const nextTurn = getNextPlayerTurn(playerNumber, allPlayers.length)
    const { error: turnError } = await supabase.from("rooms").update({ current_turn: nextTurn }).eq("id", roomId)

    if (turnError) {
      console.error("[v0] Update turn error:", turnError)
      return NextResponse.json({ error: "Failed to switch turn" }, { status: 500 })
    }

    return NextResponse.json({ success: true, won: false })
  } catch (error) {
    console.error("[v0] Mark cell error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
