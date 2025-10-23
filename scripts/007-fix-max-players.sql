-- Ensure max_players column has proper defaults and constraints
-- Update any existing rooms that have NULL max_players to default to 2
UPDATE rooms 
SET max_players = 2 
WHERE max_players IS NULL;

-- Set default value for max_players column
ALTER TABLE rooms 
ALTER COLUMN max_players SET DEFAULT 2;

-- Add constraint to ensure max_players is between 2 and 6
ALTER TABLE rooms 
ADD CONSTRAINT max_players_range CHECK (max_players >= 2 AND max_players <= 6);

-- Ensure player_count has a default
ALTER TABLE rooms 
ALTER COLUMN player_count SET DEFAULT 0;
