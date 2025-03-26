-- Add sample players
INSERT INTO players (name, elo) VALUES
  ('Alice', 1200),
  ('Bob', 1150),
  ('Charlie', 1050),
  ('Diana', 1100),
  ('Evan', 950),
  ('Fiona', 1000);

-- Add a sample match
DO $$
DECLARE
  match_id UUID;
  team1_id UUID;
  team2_id UUID;
  alice_id UUID;
  bob_id UUID;
  charlie_id UUID;
  diana_id UUID;
BEGIN
  -- Get player IDs
  SELECT id INTO alice_id FROM players WHERE name = 'Alice';
  SELECT id INTO bob_id FROM players WHERE name = 'Bob';
  SELECT id INTO charlie_id FROM players WHERE name = 'Charlie';
  SELECT id INTO diana_id FROM players WHERE name = 'Diana';
  
  -- Create a match
  INSERT INTO matches (match_date, is_team_match) 
  VALUES (NOW() - INTERVAL '1 day', TRUE) 
  RETURNING id INTO match_id;
  
  -- Create teams
  INSERT INTO team_matches (match_id, team_name, score, is_winner) 
  VALUES (match_id, 'Team A', 10, TRUE) 
  RETURNING id INTO team1_id;
  
  INSERT INTO team_matches (match_id, team_name, score, is_winner) 
  VALUES (match_id, 'Team B', 8, FALSE) 
  RETURNING id INTO team2_id;
  
  -- Record player participation
  -- Team A players
  INSERT INTO player_matches (match_id, player_id, team_match_id, elo_before, elo_after, elo_change)
  VALUES 
    (match_id, alice_id, team1_id, 1180, 1200, 20),
    (match_id, bob_id, team1_id, 1130, 1150, 20);
  
  -- Team B players
  INSERT INTO player_matches (match_id, player_id, team_match_id, elo_before, elo_after, elo_change)
  VALUES 
    (match_id, charlie_id, team2_id, 1070, 1050, -20),
    (match_id, diana_id, team2_id, 1120, 1100, -20);
  
END $$;
