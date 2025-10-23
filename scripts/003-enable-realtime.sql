-- Enable Realtime for the rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Enable Realtime for the players table
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- Grant necessary permissions
GRANT SELECT ON rooms TO anon, authenticated;
GRANT SELECT ON players TO anon, authenticated;
