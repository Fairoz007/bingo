export type GameStatus = "waiting" | "playing" | "finished"
export type PlayerNumber = string // "player1", "player2", "player3", etc.

export interface Room {
  id: string
  room_code: string
  status: GameStatus
  current_turn: PlayerNumber | null
  winner: PlayerNumber | null
  max_players: number // 2-6+
  player_count: number // Current number of players
  grid_size: number // Dynamic grid size (5x5, 6x6, 7x7, etc.)
  total_numbers: number // Total numbers in the grid (25, 36, 49, etc.)
  turn_expires_at?: number // Timestamp when turn expires
  created_at: string
}

export interface Player {
  id: string
  room_id: string
  player_number: PlayerNumber
  player_name: string
  player_avatar?: string // Optional avatar
  join_order: number // Order in which player joined (1, 2, 3, etc.)
  board: number[]
  marked_positions: number[]
  created_at: string
}

export interface GameState {
  room: Room
  players: Player[]
}
