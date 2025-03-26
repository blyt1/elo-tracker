/**
 * Calculate new ELO ratings for a team match
 * 
 * @param {Object[]} team1 - Array of players in team 1
 * @param {Object[]} team2 - Array of players in team 2
 * @param {number} team1Score - Score for team 1
 * @param {number} team2Score - Score for team 2
 * @param {number} kFactor - The K-factor determines how much ratings change (default: 32)
 * @returns {Object} Object containing updated ELO values for all players
 */
export const calculateTeamElo = (team1, team2, team1Score, team2Score, kFactor = 32) => {
  // Determine winner (1 for team1, 0 for team2, 0.5 for draw)
  let actualResult;
  if (team1Score > team2Score) {
    actualResult = 1;
  } else if (team1Score < team2Score) {
    actualResult = 0;
  } else {
    actualResult = 0.5;
  }

  // Calculate average ELO for each team
  const team1Avg = team1.reduce((sum, player) => sum + player.elo, 0) / team1.length;
  const team2Avg = team2.reduce((sum, player) => sum + player.elo, 0) / team2.length;

  // Calculate expected outcome using ELO formula
  const expectedResult = 1 / (1 + Math.pow(10, (team2Avg - team1Avg) / 400));

  // Calculate ELO change for team averages
  const eloChange = Math.round(kFactor * (actualResult - expectedResult));

  // Distribute ELO changes to individual players
  const results = {
    team1: team1.map(player => ({
      id: player.id,
      eloBefore: player.elo,
      eloAfter: player.elo + eloChange,
      eloChange: eloChange
    })),
    team2: team2.map(player => ({
      id: player.id,
      eloBefore: player.elo,
      eloAfter: player.elo - eloChange,
      eloChange: -eloChange
    })),
    team1Won: actualResult === 1,
    team2Won: actualResult === 0,
    isDraw: actualResult === 0.5
  };

  return results;
};

/**
 * Calculate new ELO ratings for individual players
 * 
 * @param {Object} player1 - First player
 * @param {Object} player2 - Second player
 * @param {number} player1Score - Score for player 1
 * @param {number} player2Score - Score for player 2
 * @param {number} kFactor - The K-factor determines how much ratings change (default: 32)
 * @returns {Object} Object containing updated ELO values for both players
 */
export const calculatePlayerElo = (player1, player2, player1Score, player2Score, kFactor = 32) => {
  // Create single-player "teams" and use the team calculation
  return calculateTeamElo([player1], [player2], player1Score, player2Score, kFactor);
};
