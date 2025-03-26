-- Create players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  elo INTEGER NOT NULL DEFAULT 1000,
  games_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_team_match BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_matches table for team-based matches
CREATE TABLE team_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN DEFAULT FALSE
);

-- Create player_matches table for tracking player participation
CREATE TABLE player_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  team_match_id UUID REFERENCES team_matches(id) ON DELETE CASCADE,
  elo_before INTEGER NOT NULL,
  elo_after INTEGER NOT NULL,
  elo_change INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_player_matches_match_id ON player_matches(match_id);
CREATE INDEX idx_player_matches_player_id ON player_matches(player_id);
CREATE INDEX idx_team_matches_match_id ON team_matches(match_id);

-- Create view for match history with player details
CREATE VIEW match_history AS
SELECT 
  m.id as match_id,
  m.match_date,
  m.is_team_match,
  tm.team_name,
  tm.score,
  tm.is_winner,
  p.id as player_id,
  p.name as player_name,
  pm.elo_before,
  pm.elo_after,
  pm.elo_change
FROM matches m
LEFT JOIN team_matches tm ON tm.match_id = m.id
LEFT JOIN player_matches pm ON pm.team_match_id = tm.id
LEFT JOIN players p ON p.id = pm.player_id
ORDER BY m.match_date DESC;

-- Function to update player ELO
CREATE OR REPLACE FUNCTION update_player_elo()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE players
  SET 
    elo = NEW.elo_after,
    games_played = games_played + 1,
    wins = CASE WHEN NEW.elo_change > 0 THEN wins + 1 ELSE wins END,
    losses = CASE WHEN NEW.elo_change < 0 THEN losses + 1 ELSE losses END,
    updated_at = NOW()
  WHERE id = NEW.player_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update player ELO after a match
CREATE TRIGGER tr_update_player_elo
AFTER INSERT ON player_matches
FOR EACH ROW
EXECUTE FUNCTION update_player_elo();
