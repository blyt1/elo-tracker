// src/lib/trueskill.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

/**
 * Execute a Python TrueSkill calculation script
 * 
 * @param {string} scriptName - Name of the Python script to execute
 * @param {Object} data - Data to pass to the Python script
 * @returns {Promise<Object>} - Results from the TrueSkill calculation
 */
export async function executeTrueSkillCalculation(scriptName, data) {
  try {
    // Create a temporary JSON file to pass data to Python
    const tempFilePath = path.join(process.cwd(), 'temp_data.json');
    await fs.writeFile(tempFilePath, JSON.stringify(data));

    // Path to the Python script
    const scriptPath = path.join(process.cwd(), 'python', `${scriptName}.py`);

    // Spawn a Python process
    return new Promise((resolve, reject) => {
      // Adjust the path to your virtual environment's Python executable
      const pythonProcess = spawn('./venv/bin/python', [scriptPath, tempFilePath]);
      
      let result = '';
      let errorData = '';

      // Collect data from stdout
      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      // Collect error data
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', async (code) => {
        // Clean up the temporary file
        await fs.unlink(tempFilePath);
        
        if (code !== 0) {
          return reject(new Error(`Python process exited with code ${code}: ${errorData}`));
        }
        
        try {
          // Parse the JSON result from the Python script
          const parsedResult = JSON.parse(result);
          resolve(parsedResult);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error.message}`));
        }
      });
    });
  } catch (error) {
    console.error('Error executing TrueSkill calculation:', error);
    throw error;
  }
}

/**
 * Calculate new TrueSkill ratings for a team match
 * 
 * @param {Object[]} team1 - Array of players in team 1
 * @param {Object[]} team2 - Array of players in team 2
 * @param {number} team1Score - Score for team 1
 * @param {number} team2Score - Score for team 2
 * @returns {Promise<Object>} - Updated ratings for all players
 */
export async function calculateTeamRating(team1, team2, team1Score, team2Score) {
  const data = {
    team1: team1.map(player => ({
      id: player.id,
      name: player.name,
      mu: player.mu || 1000,
      sigma: player.sigma || 333.33
    })),
    team2: team2.map(player => ({
      id: player.id,
      name: player.name,
      mu: player.mu || 1000,
      sigma: player.sigma || 333.33
    })),
    team1_score: team1Score,
    team2_score: team2Score
  };
  
  return executeTrueSkillCalculation('calculate_team_rating', data);
}

/**
 * Calculate new TrueSkill ratings for individual players
 * 
 * @param {Object} player1 - First player
 * @param {Object} player2 - Second player
 * @param {number} player1Score - Score for player 1
 * @param {number} player2Score - Score for player 2
 * @returns {Promise<Object>} - Updated ratings for both players
 */
export async function calculatePlayerRating(player1, player2, player1Score, player2Score) {
  // Reuse the team rating calculation with single-player teams
  return calculateTeamRating([player1], [player2], player1Score, player2Score);
}
