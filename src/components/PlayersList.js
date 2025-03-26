'use client';

const PlayersList = ({ players, isLoading }) => {
  const getEloColor = (elo) => {
    if (elo >= 1200) return 'text-green-600';
    if (elo >= 1000) return 'text-blue-600';
    return 'text-red-600';
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

  return (
    <div className="card">
      <h2>Player Rankings</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Rank</th>
              <th className="text-left py-2">Name</th>
              <th className="text-right py-2">ELO</th>
              <th className="text-right py-2">W/L</th>
              <th className="text-right py-2">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              const winRate = player.games_played > 0 
                ? Math.round((player.wins / player.games_played) * 100)
                : 0;
                
              return (
                <tr key={player.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{player.name}</td>
                  <td className={`py-2 text-right font-medium ${getEloColor(player.elo)}`}>
                    {player.elo}
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
    </div>
  );
};

export default PlayersList;
