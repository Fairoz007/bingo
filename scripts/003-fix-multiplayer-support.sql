-- Add join_order column to players table if it doesn't exist
ALTER TABLE players ADD COLUMN IF NOT EXISTS join_order INTEGER;

-- Add player_avatar column to players table if it doesn't exist
ALTER TABLE players ADD COLUMN IF NOT EXISTS player_avatar TEXT DEFAULT '👤';

-- Add expires_at column to rooms table if it doesn't exist
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add max_players, player_count, grid_size, total_numbers columns to rooms table if they don't exist
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 2;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS player_count INTEGER DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS grid_size INTEGER DEFAULT 5;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS total_numbers INTEGER DEFAULT 25;

-- Update the UNIQUE constraint on players to allow dynamic player numbers
-- Drop the old constraint if it exists
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_room_id_player_number_key;

-- Add a new constraint that allows multiple players per room
ALTER TABLE players ADD CONSTRAINT players_room_id_join_order_key UNIQUE(room_id, join_order);

-- Create an index on join_order for better query performance
CREATE INDEX IF NOT EXISTS idx_players_join_order ON players(room_id, join_order);

-- Update existing rooms to have proper max_players if not set
UPDATE rooms SET max_players = 2, player_count = 0, grid_size = 5, total_numbers = 25 WHERE max_players IS NULL OR max_players = 0;
