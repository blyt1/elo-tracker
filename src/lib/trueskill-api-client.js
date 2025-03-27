/**
 * Client for the TrueSkill API service
 * This replaces the local Python integration
 */

// API endpoint for the TrueSkill calculations
const TRUESKILL_API_URL = process.env.NEXT_PUBLIC_TRUESKILL_API_URL || 'https://your-trueskill-api.example.com/calculate-trueskill';

/**
 * Calculate team TrueSkill ratings via the API service
 * 
 * @param {Object[]} team1 - Array of players in team 1
 * @param {Object[]} team2 - Array of players in team 2
 * @param {number} team1Score - Score for team 1
 * @param {number} team2Score - Score for team 2
 * @returns {Promise<Object>} Updated ratings
 */
export async function calculateTeamRating(team1, team2, team1Score, team2Score) {
  try {
    // Prepare data for the API
    const requestData = {
      team1: team1.map(player => ({
        id: player.id,
        name: player.name,
        mu: player.mu !== undefined ? player.mu : 1000,
        sigma: player.sigma !== undefined ? player.sigma : 333.33
      })),
      team2: team2.map(player => ({
        id: player.id,
        name: player.name,
        mu: player.mu !== undefined ? player.mu : 1000,
        sigma: player.sigma !== undefined ? player.sigma : 333.33
      })),
      team1_score: team1Score,
      team2_score: team2Score
    };

    // Send request to the API
    const response = await fetch(TRUESKILL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // Check for errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    // Parse and return the results
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calculating TrueSkill ratings:', error);
    throw error;
  }
}

/**
 * Calculate player TrueSkill ratings via the API service
 * 
 * @param {Object} player1 - First player
 * @param {Object} player2 - Second player
 * @param {number} player1Score - Score for player 1
 * @param {number} player2Score - Score for player 2
 * @returns {Promise<Object>} Updated ratings
 */
export async function calculatePlayerRating(player1, player2, player1Score, player2Score) {
  // Create single-player teams and use the team calculation
  return calculateTeamRating([player1], [player2], player1Score, player2Score);
}
