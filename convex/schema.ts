import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    room_code: v.string(),
    status: v.string(), // "waiting", "playing", "finished"
    current_turn: v.optional(v.string()), // player number e.g. "player1"
    winner: v.optional(v.string()), // player number e.g. "player1"
    max_players: v.number(),
    player_count: v.number(),
    grid_size: v.number(),
    total_numbers: v.number(),
    expires_at: v.string(), // ISO date string
    turn_expires_at: v.optional(v.number()), // timestamp for turn expiration
  }).index("by_room_code", ["room_code"]),

  players: defineTable({
    room_id: v.id("rooms"),
    player_number: v.string(), // "player1", "player2", etc.
    player_name: v.string(),
    player_avatar: v.string(),
    join_order: v.number(),
    board: v.array(v.number()), // array of numbers
    marked_positions: v.array(v.number()), // array of indices
  }).index("by_room_id", ["room_id"]),
});
