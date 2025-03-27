'use client';

import { calculateConservativeRating } from '@/lib/trueskill';

const PlayersList = ({ players, isLoading }) => {
  // Modified from your selected Option 3
  
  const getUncertaintyDots = (player) => {
    if (player.sigma === undefined) return null;
    
    // Higher sigma means more uncertainty
    if (player.sigma > 200) {
      return (
        <span className="ml-1 inline-flex space-x-0.5">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
        </span>
      );
    } else if (player.sigma > 100) {
      return (
        <span className="ml-1 inline-flex space-x-0.5">
          <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
          <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
        </span>
      );
    } else if (player.sigma > 50) {
      return (
        <span className="ml-1 inline-flex">
          <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
        </span>
      );
    }
    return null;
  };

  const getWinRateBar = (wins, losses) => {
    const games = wins + losses;
    const rate = games > 0 ? Math.round((wins / games) * 100) : 0;
    
    return (
      <div className="w-full bg-gray-200 rounded h-2 mt-1">
        <div 
          className={`h-2 rounded ${rate >= 50 ? 'bg-green-500' : 'bg-red-500'}`} 
          style={{ width: `${rate}%` }}
        ></div>
      </div>
    );
  };

  // Handle loading state
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

  // Handle empty state
  if (!players?.length) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500">No players found. Add your first player!</p>
      </div>
    );
  }

  // Calculate rating for each player to sort them
  const getConservativeRating = (player) => {
    if (player.mu !== undefined && player.sigma !== undefined) {
      return Math.round(calculateConservativeRating(player.mu, player.sigma));
    }
    // Fall back to ELO if TrueSkill values aren't available
    return player.elo;
  };

  // Sort players by rating
  const sortedPlayers = [...players].sort((a, b) => 
    getConservativeRating(b) - getConservativeRating(a)
  );

  return (
    <div className="card">
      <h2>Player Rankings</h2>
      
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left font-semibold text-gray-800">#</th>
              <th className="p-2 text-left font-semibold text-gray-800">Player</th>
              <th className="p-2 text-center font-semibold text-gray-800">Rating</th>
              <th className="p-2 text-center font-semibold text-gray-800">μ / σ</th>
              <th className="p-2 text-center font-semibold text-gray-800">Win/Loss</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, idx) => {
              const rating = getConservativeRating(player);
              const winRate = player.games_played > 0 
                ? Math.round((player.wins / player.games_played) * 100)
                : 0;
                
              return (
                <tr key={player.id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 border-b`}>
                  <td className="p-2 font-medium">{idx + 1}</td>
                  <td className="p-2">
                    <div className="font-medium capitalize">{player.name}</div>
                  </td>
                  <td className="p-2 text-center">
                    <div className={`font-bold ${rating >= 1000 ? 'text-green-600' : rating >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {rating}
                      {getUncertaintyDots(player)}
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex justify-center space-x-2 text-gray-700">
                      <span>{player.mu !== undefined ? Math.round(player.mu) : '-'}</span>
                      <span>/</span>
                      <span>{player.sigma !== undefined ? Math.round(player.sigma) : '-'}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-center">
                      <div className="font-medium">
                        {player.wins}-{player.losses} ({winRate}%)
                      </div>
                      {getWinRateBar(player.wins, player.losses)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs bg-gray-50 p-3 rounded border grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <span className="font-medium">Rating System:</span> μ - 3σ (conservative estimate)
        </div>
        <div>
          <span className="font-medium">Uncertainty:</span>
          <span className="inline-flex items-center ml-1">
            <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
            <span className="mx-1">Moderate</span>
            <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
            <span className="w-1 h-1 bg-orange-500 rounded-full ml-0.5"></span>
            <span className="mx-1">High</span>
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            <span className="w-1 h-1 bg-red-500 rounded-full ml-0.5"></span>
            <span className="w-1 h-1 bg-red-500 rounded-full ml-0.5"></span>
            <span className="ml-1">Very High</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlayersList;