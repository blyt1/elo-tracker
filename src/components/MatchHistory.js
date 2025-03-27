'use client';

import { useState, useEffect } from 'react';
import { getMatchHistory } from '@/lib/supabase';
import toast from 'react-hot-toast';

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrueSkill, setShowTrueSkill] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getMatchHistory();
        setMatches(data);
      } catch (error) {
        console.error('Error fetching match history:', error);
        toast.error('Failed to load match history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  // Toggle between showing TrueSkill and ELO
  const toggleRatingSystem = () => {
    setShowTrueSkill(!showTrueSkill);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!matches?.length) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500">No matches have been recorded yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button 
          onClick={toggleRatingSystem} 
          className="btn btn-sm btn-secondary"
        >
          Show {showTrueSkill ? 'ELO' : 'TrueSkill'} Ratings
        </button>
      </div>

      <div className="space-y-6">
        {matches.map((match) => (
          <div key={match.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">
                Match on {formatDate(match.date)}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {match.teams.map((team, index) => (
                <div 
                  key={index} 
                  className={`border rounded p-4 ${
                    team.isWinner ? 'border-green-500 bg-green-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">
                      {team.name}
                      {team.isWinner && (
                        <span className="badge badge-green ml-2">Winner</span>
                      )}
                    </h4>
                    <div className="text-xl font-bold">
                      {team.score}
                    </div>
                  </div>

                  {showTrueSkill && team.players[0]?.mu_before !== undefined ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-2 px-3 text-left">Player</th>
                            <th className="py-2 px-3 text-center">μ</th>
                            <th className="py-2 px-3 text-center">σ</th>
                            <th className="py-2 px-3 text-center">Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {team.players.map((player) => {
                            const conservativeBefore = Math.round(player.mu_before - 3 * player.sigma_before);
                            const conservativeAfter = Math.round(player.mu_after - 3 * player.sigma_after);
                            const conservativeChange = conservativeAfter - conservativeBefore;
                            
                            // Determine if the change is aligned with team result
                            const isAligned = (team.isWinner && conservativeChange > 0) || 
                                            (!team.isWinner && conservativeChange < 0) ||
                                            (conservativeChange === 0);
                            
                            return (
                              <tr key={player.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-3 font-medium">{player.name}</td>
                                <td className="py-2 px-3 text-center">
                                  <div className="flex flex-col items-center">
                                    <div>{Math.round(player.mu_before)} → {Math.round(player.mu_after)}</div>
                                    <div className={`text-xs font-medium ${
                                      player.mu_after > player.mu_before 
                                        ? 'text-green-600' 
                                        : player.mu_after < player.mu_before 
                                          ? 'text-red-600' 
                                          : ''
                                    }`}>
                                      {player.mu_after > player.mu_before ? '+' : ''}
                                      {Math.round(player.mu_after - player.mu_before)}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <div className="flex flex-col items-center">
                                    <div>{Math.round(player.sigma_before)} → {Math.round(player.sigma_after)}</div>
                                    <div className={`text-xs font-medium ${
                                      player.sigma_after < player.sigma_before 
                                        ? 'text-green-600' 
                                        : player.sigma_after > player.sigma_before 
                                          ? 'text-red-600' 
                                          : ''
                                    }`}>
                                      {player.sigma_after < player.sigma_before ? '' : '+'}
                                      {Math.round(player.sigma_after - player.sigma_before)}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <div className="flex flex-col items-center">
                                    <div>{conservativeBefore} → {conservativeAfter}</div>
                                    <div className={`text-xs font-medium ${
                                      conservativeChange > 0 
                                        ? 'text-green-600' 
                                        : conservativeChange < 0
                                          ? 'text-red-600' 
                                          : ''
                                    }`}>
                                      {conservativeChange > 0 ? '+' : ''}
                                      {conservativeChange}
                                      {!isAligned && (
                                        <span 
                                          className="ml-1 text-amber-600" 
                                          title="Rating changed contrary to match result due to uncertainty reduction"
                                        >
                                          *
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-2 px-3 text-left">Player</th>
                            <th className="py-2 px-3 text-center">ELO Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {team.players.map((player) => (
                            <tr key={player.id} className="border-b hover:bg-gray-50">
                              <td className="py-2 px-3 font-medium">{player.name}</td>
                              <td className="py-2 px-3 text-center">
                                <div className="flex flex-col items-center">
                                  <div>{player.eloBefore} → {player.eloAfter}</div>
                                  <div className={`text-xs font-medium ${
                                    player.eloChange > 0 
                                      ? 'text-green-600' 
                                      : player.eloChange < 0 
                                        ? 'text-red-600' 
                                        : ''
                                  }`}>
                                    {player.eloChange > 0 ? '+' : ''}
                                    {player.eloChange}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Add an explanation for anomalous rating changes */}
            {showTrueSkill && (
              <div className="mt-3 text-xs text-gray-500 italic">
                * Rating may increase despite a loss (or decrease despite a win) when the reduction in uncertainty (σ) outweighs the change in skill estimate (μ).
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchHistory;