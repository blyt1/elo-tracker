import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Player-related functions
export const getPlayers = async () => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('elo', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addPlayer = async (name) => {
  const { data, error } = await supabase
    .from('players')
    .insert([{ name }])
    .select();
  
  if (error) throw error;
  return data[0];
};

// Match-related functions
export const createMatch = async (isTeamMatch = true) => {
  const { data, error } = await supabase
    .from('matches')
    .insert([{ is_team_match: isTeamMatch }])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const createTeam = async (matchId, teamName, score, isWinner) => {
  const { data, error } = await supabase
    .from('team_matches')
    .insert([{ 
      match_id: matchId, 
      team_name: teamName, 
      score: score, 
      is_winner: isWinner 
    }])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const addPlayerToMatch = async (matchId, playerId, teamMatchId, eloBefore, eloAfter, eloChange) => {
  const { data, error } = await supabase
    .from('player_matches')
    .insert([{ 
      match_id: matchId, 
      player_id: playerId, 
      team_match_id: teamMatchId, 
      elo_before: eloBefore, 
      elo_after: eloAfter, 
      elo_change: eloChange 
    }]);
  
  if (error) throw error;
  return true;
};

// History-related functions
export const getMatchHistory = async () => {
  const { data, error } = await supabase
    .from('match_history')
    .select('*')
    .order('match_date', { ascending: false });
  
  if (error) throw error;
  
  // Group by match for easier rendering
  const matchesMap = new Map();
  
  data.forEach(record => {
    if (!matchesMap.has(record.match_id)) {
      matchesMap.set(record.match_id, {
        id: record.match_id,
        date: record.match_date,
        isTeamMatch: record.is_team_match,
        teams: []
      });
    }
    
    const match = matchesMap.get(record.match_id);
    let team = match.teams.find(t => t.name === record.team_name);
    
    if (!team) {
      team = {
        name: record.team_name,
        score: record.score,
        isWinner: record.is_winner,
        players: []
      };
      match.teams.push(team);
    }
    
    if (record.player_id) {
      team.players.push({
        id: record.player_id,
        name: record.player_name,
        eloBefore: record.elo_before,
        eloAfter: record.elo_after,
        eloChange: record.elo_change
      });
    }
  });
  
  return Array.from(matchesMap.values());
};
