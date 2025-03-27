'use client';

import { calculateConservativeRating } from '@/lib/trueskill';

const PlayersList = ({ players, isLoading }) => {
  // Function to calculate and return the conservative rating
  const getConservativeRating = (player) => {
    if (player.mu !== undefined && player.sigma !== undefined) {
      return Math.round(calculateConservativeRating(player.mu, player.sigma));
    }
    // Fall back to ELO if TrueSkill values aren't available
    return player.elo;
  };

  // Function to get color based on rating
  const getRatingColor = (rating) => {
    if (rating >= 1200) return 'text-green-600';
    if (rating >= 1000) return 'text-blue-600';
    return 'text-red-600';
  };

  // Function to get player uncertainty indicator
  const getUncertaintyIndicator = (player) => {
    if (player.sigma === undefined) return '';
    
    // Higher sigma means more uncertainty
    if (player.sigma > 200) {
      return '???'; // Very uncertain
    } else if (player.sigma > 100) {
      return '??'; // Somewhat uncertain
    } else if (player.sigma > 50) {
      return '?'; // A little uncertain
    }
    return ''; // Fairly certain
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!players?.length) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500">No players found. Add your first player!</p>
      </div>
    );
  }

  // Sort players by conservative rating
  const sortedPlayers = [...players].sort((a, b) => 
    getConservativeRating(b) - getConservativeRating(a)
  );

  return (
    <div className="card">
      <h2>Player Rankings</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Rank</th>
              <th className="text-left py-2">Name</th>
              <th className="text-right py-2">Rating</th>
              <th className="text-right py-2">μ</th>
              <th className="text-right py-2">σ</th>
              <th className="text-right py-2">W/L</th>
              <th className="text-right py-2">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const winRate = player.games_played > 0 
                ? Math.round((player.wins / player.games_played) * 100)
                : 0;
              
              const rating = getConservativeRating(player);
              const uncertainty = getUncertaintyIndicator(player);
                
              return (
                <tr key={player.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{player.name}</td>
                  <td className={`py-2 text-right font-medium ${getRatingColor(rating)}`}>
                    {rating} {uncertainty && <span className="text-gray-500">{uncertainty}</span>}
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {player.mu !== undefined ? Math.round(player.mu) : '-'}
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {player.sigma !== undefined ? Math.round(player.sigma) : '-'}
                  </td>
                  <td className="py-2 text-right">
                    {player.wins}-{player.losses}
                  </td>
                  <td className="py-2 text-right">
                    {winRate}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>Rating = μ - 3σ (conservative estimate of skill)</p>
        <p>μ (mu) = Estimated skill level</p>
        <p>σ (sigma) = Uncertainty in the skill estimate</p>
        <p>? = Moderate uncertainty, ?? = High uncertainty, ??? = Very high uncertainty</p>
      </div>
    </div>
  );
};

export default PlayersList;