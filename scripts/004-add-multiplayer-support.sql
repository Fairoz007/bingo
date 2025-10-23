-- Add multiplayer support to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 2;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS player_count INTEGER DEFAULT 0;

-- Update players table to support more than 2 players
-- Change player_number to support player1, player2, player3, etc.
ALTER TABLE players ADD COLUMN IF NOT EXISTS player_avatar TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS join_order INTEGER;

-- Drop the old unique constraint
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_room_id_player_number_key;

-- Add new unique constraint to prevent duplicate player numbers per room
ALTER TABLE players ADD CONSTRAINT players_room_player_unique UNIQUE(room_id, player_number);

-- Create index for join order
CREATE INDEX IF NOT EXISTS idx_players_join_order ON players(room_id, join_order);
