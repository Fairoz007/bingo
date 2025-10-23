-- Add missing columns to rooms table for better game management
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 2;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS player_count INTEGER DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS grid_size INTEGER DEFAULT 5;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS total_numbers INTEGER DEFAULT 25;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours';

-- Add player_avatar column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS player_avatar TEXT DEFAULT '👤';

-- Add index for room expiration cleanup
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON rooms(expires_at);
