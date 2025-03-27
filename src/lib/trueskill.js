/**
 * TrueSkill implementation for JavaScript
 * Based on the TrueSkill algorithm by Microsoft Research
 */

// Default TrueSkill parameters
const DEFAULT_MU = 1000;
const DEFAULT_SIGMA = 333.33;
const DEFAULT_BETA = 166.67;
const DEFAULT_TAU = 1.0;
const DEFAULT_DRAW_PROBABILITY = 0.10;

/**
 * Calculate the Gaussian function at x with mean mu and standard deviation sigma
 */
function gaussian(x, mu, sigma) {
  return Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2))) / (sigma * Math.sqrt(2 * Math.PI));
}

/**
 * Calculate the cumulative distribution function of the standard normal distribution
 */
function cumulativeNormal(x) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

/**
 * Error function approximation
 */
function erf(x) {
  // Constants
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  // Save the sign of x
  let sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Calculate the V function used in TrueSkill
 */
function v(x, mean, variance) {
  const denom = cumulativeNormal((mean - x) / Math.sqrt(variance));
  return denom > 1e-10 ? gaussian((mean - x) / Math.sqrt(variance), 0, 1) / denom : -x + mean;
}

/**
 * Calculate the W function used in TrueSkill
 */
function w(x, mean, variance) {
  const v_x = v(x, mean, variance);
  return v_x * (v_x + x - mean);
}

/**
 * Calculate new TrueSkill ratings for a match between two teams
 * 
 * @param {Object[]} team1 - Array of players in team 1 (each with mu and sigma)
 * @param {Object[]} team2 - Array of players in team 2 (each with mu and sigma)
 * @param {number} team1Score - Score for team 1
 * @param {number} team2Score - Score for team 2
 * @returns {Object} Object containing updated TrueSkill values for all players
 */
export function calculateTeamTrueSkill(team1, team2, team1Score, team2Score) {
  // Determine outcome (1 for team1 win, 0 for team2 win, 0.5 for draw)
  let outcome;
  if (team1Score > team2Score) {
    outcome = 1;
  } else if (team1Score < team2Score) {
    outcome = 0;
  } else {
    outcome = 0.5;
  }

  // Calculate team rating means and variances
  const team1Mu = team1.reduce((sum, player) => sum + (player.mu || DEFAULT_MU), 0);
  const team2Mu = team2.reduce((sum, player) => sum + (player.mu || DEFAULT_MU), 0);
  
  const team1Sigma = Math.sqrt(team1.reduce((sum, player) => {
    const sigma = player.sigma || DEFAULT_SIGMA;
    return sum + (sigma * sigma);
  }, 0));
  
  const team2Sigma = Math.sqrt(team2.reduce((sum, player) => {
    const sigma = player.sigma || DEFAULT_SIGMA;
    return sum + (sigma * sigma);
  }, 0));

  // Calculate match quality (probability of draw)
  const betaSquared = 2 * DEFAULT_BETA * DEFAULT_BETA;
  const meanDelta = team1Mu - team2Mu;
  const varianceSum = 2 * betaSquared + team1Sigma * team1Sigma + team2Sigma * team2Sigma;
  const matchQuality = Math.exp(-meanDelta * meanDelta / (2 * varianceSum));

  // Only in a draw do we need to adjust based on the probability
  const drawMargin = outcome === 0.5 ? 
    cumulativeNormal(DEFAULT_DRAW_PROBABILITY / 2) * Math.sqrt(varianceSum) : 0;

  // Calculate the performance update for each team
  const team1Performance = outcome === 0.5 ? 
    team1Mu : 
    team1Mu + (outcome === 1 ? 1 : -1) * team1Sigma * 
      v((outcome === 1 ? 1 : -1) * (meanDelta - drawMargin) / Math.sqrt(varianceSum), 0, 1);
  
  const team2Performance = outcome === 0.5 ? 
    team2Mu : 
    team2Mu + (outcome === 0 ? 1 : -1) * team2Sigma * 
      v((outcome === 0 ? 1 : -1) * (meanDelta - drawMargin) / Math.sqrt(varianceSum), 0, 1);

  // Calculate the amount each player's rating should be updated
  // based on their relative contribution to the team
  const results = {
    team1: team1.map(player => {
      const oldMu = player.mu || DEFAULT_MU;
      const oldSigma = player.sigma || DEFAULT_SIGMA;
      
      // The weight is proportional to the variance (uncertainty) of this player's rating
      const weight = (oldSigma * oldSigma) / (team1Sigma * team1Sigma);
      
      // Update mu based on the weight and the team performance
      const newMu = oldMu + weight * (team1Performance - team1Mu);
      
      // Update sigma (it always decreases after a match)
      const updatedVariance = (oldSigma * oldSigma) * (1 - weight);
      const newSigma = Math.sqrt(updatedVariance + DEFAULT_TAU * DEFAULT_TAU);
      
      // Calculate the conservative rating (used for display/ranking)
      const conservativeRating = newMu - 3 * newSigma;
      
      return {
        id: player.id,
        muBefore: oldMu,
        muAfter: newMu,
        sigmaBefore: oldSigma,
        sigmaAfter: newSigma,
        conservativeRatingBefore: oldMu - 3 * oldSigma,
        conservativeRatingAfter: conservativeRating,
        muChange: newMu - oldMu,
        sigmaChange: newSigma - oldSigma
      };
    }),
    team2: team2.map(player => {
      const oldMu = player.mu || DEFAULT_MU;
      const oldSigma = player.sigma || DEFAULT_SIGMA;
      
      const weight = (oldSigma * oldSigma) / (team2Sigma * team2Sigma);
      const newMu = oldMu + weight * (team2Performance - team2Mu);
      
      const updatedVariance = (oldSigma * oldSigma) * (1 - weight);
      const newSigma = Math.sqrt(updatedVariance + DEFAULT_TAU * DEFAULT_TAU);
      
      const conservativeRating = newMu - 3 * newSigma;
      
      return {
        id: player.id,
        muBefore: oldMu,
        muAfter: newMu,
        sigmaBefore: oldSigma,
        sigmaAfter: newSigma,
        conservativeRatingBefore: oldMu - 3 * oldSigma,
        conservativeRatingAfter: conservativeRating,
        muChange: newMu - oldMu,
        sigmaChange: newSigma - oldSigma
      };
    }),
    team1Won: outcome === 1,
    team2Won: outcome === 0,
    isDraw: outcome === 0.5,
    matchQuality
  };

  return results;
}

/**
 * Calculate new TrueSkill ratings for individual players
 * 
 * @param {Object} player1 - First player (with mu and sigma)
 * @param {Object} player2 - Second player (with mu and sigma)
 * @param {number} player1Score - Score for player 1
 * @param {number} player2Score - Score for player 2
 * @returns {Object} Object containing updated TrueSkill values for both players
 */
export function calculatePlayerTrueSkill(player1, player2, player1Score, player2Score) {
  // Create single-player "teams" and use the team calculation
  return calculateTeamTrueSkill([player1], [player2], player1Score, player2Score);
}

/**
 * Calculate the conservative rating (μ - 3σ) for display/ranking
 * This is the same as the TrueSkill expose function
 * 
 * @param {number} mu - The mean of the player's rating
 * @param {number} sigma - The standard deviation of the player's rating
 * @returns {number} The conservative rating
 */
export function calculateConservativeRating(mu, sigma) {
  return mu - 3 * sigma;
}
