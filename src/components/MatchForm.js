'use client';

import { useState, useEffect } from 'react';
import {
  getPlayers,
  createMatch,
  createTeam,
  addPlayerToMatch
} from '@/lib/supabase';
import { calculateTeamTrueSkill } from '@/lib/trueskill';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const MatchForm = () => {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Team 1 state
  const [team1Name, setTeam1Name] = useState('Team A');
  const [team1Score, setTeam1Score] = useState(0);
  const [team1Players, setTeam1Players] = useState([]);

  // Team 2 state
  const [team2Name, setTeam2Name] = useState('Team B');
  const [team2Score, setTeam2Score] = useState(0);
  const [team2Players, setTeam2Players] = useState([]);

  // Fetch players on component mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await getPlayers();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
        toast.error('Failed to load players');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Handle adding player to team
  const handleAddPlayerToTeam = (playerId, team) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    if (team === 1) {
      if (team1Players.some(p => p.id === playerId)) {
        return; // Player already in team
      }
      setTeam1Players([...team1Players, player]);
    } else {
      if (team2Players.some(p => p.id === playerId)) {
        return; // Player already in team
      }
      setTeam2Players([...team2Players, player]);
    }
  };

  // Handle removing player from team
  const handleRemovePlayerFromTeam = (playerId, team) => {
    if (team === 1) {
      setTeam1Players(team1Players.filter(p => p.id !== playerId));
    } else {
      setTeam2Players(team2Players.filter(p => p.id !== playerId));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (team1Players.length === 0 || team2Players.length === 0) {
      toast.error('Each team must have at least one player');
      return;
    }

    if (team1Score < 0 || team2Score < 0) {
      toast.error('Scores cannot be negative');
      return;
    }

    if (team1Score === 0 && team2Score === 0) {
      toast.error('At least one team must score');
      return;
    }

    // Start submission
    setIsSubmitting(true);

    try {
      // Calculate TrueSkill changes
      const trueskillResults = calculateTeamTrueSkill(
        team1Players,
        team2Players,
        team1Score,
        team2Score
      );

      // Create match record
      const match = await createMatch(true);

      // Create team records
      const team1Record = await createTeam(
        match.id,
        team1Name,
        team1Score,
        trueskillResults.team1Won
      );

      const team2Record = await createTeam(
        match.id,
        team2Name,
        team2Score,
        trueskillResults.team2Won
      );
      // In src/components/MatchForm.js
      // Modify the part where player match records are added

      // Add player records for team 1
      for (const player of trueskillResults.team1) {
        // Calculate the raw rating change
        const ratingChange = Math.round(player.conservativeRatingAfter - player.conservativeRatingBefore);

        // Ensure winners always get positive changes and losers always get negative
        // This aligns with how the database trigger determines wins/losses
        const adjustedEloChange = trueskillResults.team1Won
          ? Math.abs(ratingChange) // Winner gets positive change
          : trueskillResults.isDraw
            ? ratingChange // Draw keeps original change
            : -Math.abs(ratingChange); // Loser gets negative change

        await addPlayerToMatch(
          match.id,
          player.id,
          team1Record.id,
          // For backward compatibility, still update elo fields
          Math.round(player.conservativeRatingBefore),
          Math.round(player.conservativeRatingAfter),
          adjustedEloChange, // Use adjusted change
          // New TrueSkill fields
          player.muBefore,
          player.muAfter,
          player.sigmaBefore,
          player.sigmaAfter
        );
      }

      // Add player records for team 2
      for (const player of trueskillResults.team2) {
        // Calculate the raw rating change
        const ratingChange = Math.round(player.conservativeRatingAfter - player.conservativeRatingBefore);

        // Ensure winners always get positive changes and losers always get negative
        const adjustedEloChange = trueskillResults.team2Won
          ? Math.abs(ratingChange) // Winner gets positive change
          : trueskillResults.isDraw
            ? ratingChange // Draw keeps original change
            : -Math.abs(ratingChange); // Loser gets negative change

        await addPlayerToMatch(
          match.id,
          player.id,
          team2Record.id,
          // For backward compatibility, still update elo fields
          Math.round(player.conservativeRatingBefore),
          Math.round(player.conservativeRatingAfter),
          adjustedEloChange, // Use adjusted change
          // New TrueSkill fields
          player.muBefore,
          player.muAfter,
          player.sigmaBefore,
          player.sigmaAfter
        );
      }

      toast.success('Match recorded successfully!');

      // Redirect to history page
      router.push('/history');
    } catch (error) {
      console.error('Error recording match:', error);
      toast.error('Failed to record match');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available players (not in any team)
  const availablePlayers = players.filter(player =>
    !team1Players.some(p => p.id === player.id) &&
    !team2Players.some(p => p.id === player.id)
  );

  // Function to display player rating (either TrueSkill or fallback to ELO)
  const displayRating = (player) => {
    if (player.mu !== undefined && player.sigma !== undefined) {
      // Calculate conservative rating (μ - 3σ)
      return Math.round(player.mu - 3 * player.sigma);
    }
    // Fall back to ELO if TrueSkill values aren't available
    return player.elo;
  };

  return (
    <div className="card">
      <h2>Record New Match</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Team 1 */}
          <div className="border rounded p-4">
            <h3 className="text-lg font-medium mb-3">Team 1</h3>

            <div className="mb-4">
              <label htmlFor="team1Name" className="label">Team Name</label>
              <input
                id="team1Name"
                type="text"
                className="input"
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="team1Score" className="label">Score</label>
              <input
                id="team1Score"
                type="number"
                min="0"
                className="input"
                value={team1Score}
                onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="label">Team Players</label>
              <div className="space-y-2">
                {team1Players.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span>{player.name} ({displayRating(player)})</span>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => handleRemovePlayerFromTeam(player.id, 1)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {team1Players.length === 0 && (
                  <div className="text-gray-500 text-sm italic">No players selected</div>
                )}
              </div>
            </div>
          </div>

          {/* Team 2 */}
          <div className="border rounded p-4">
            <h3 className="text-lg font-medium mb-3">Team 2</h3>

            <div className="mb-4">
              <label htmlFor="team2Name" className="label">Team Name</label>
              <input
                id="team2Name"
                type="text"
                className="input"
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="team2Score" className="label">Score</label>
              <input
                id="team2Score"
                type="number"
                min="0"
                className="input"
                value={team2Score}
                onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="label">Team Players</label>
              <div className="space-y-2">
                {team2Players.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span>{player.name} ({displayRating(player)})</span>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => handleRemovePlayerFromTeam(player.id, 2)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {team2Players.length === 0 && (
                  <div className="text-gray-500 text-sm italic">No players selected</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Available Players */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Available Players</h3>

          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availablePlayers.map(player => (
                <div key={player.id} className="border rounded p-3 flex justify-between items-center">
                  <span>
                    {player.name} ({displayRating(player)})
                  </span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleAddPlayerToTeam(player.id, 1)}
                    >
                      Team 1
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleAddPlayerToTeam(player.id, 2)}
                    >
                      Team 2
                    </button>
                  </div>
                </div>
              ))}

              {availablePlayers.length === 0 && (
                <div className="text-gray-500 text-sm italic col-span-full">
                  No more available players
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Recording Match...' : 'Record Match'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MatchForm;