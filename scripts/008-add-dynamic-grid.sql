-- Add grid_size and total_numbers columns to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS grid_size INTEGER DEFAULT 5;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS total_numbers INTEGER DEFAULT 25;

-- Update existing rooms to have default values
UPDATE rooms SET grid_size = 5, total_numbers = 25 WHERE grid_size IS NULL;
