'use client';

import { useState, useEffect } from 'react';
import { getMatchHistory } from '@/lib/supabase';
import toast from 'react-hot-toast';

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

                <div className="space-y-2">
                  <div className="text-sm text-gray-600 border-b pb-1 mb-1">
                    Players
                  </div>
                  {team.players.map((player) => (
                    <div key={player.id} className="flex justify-between items-center">
                      <span>{player.name}</span>
                      <div className="flex items-center">
                        <span className="mr-2">
                          {player.eloBefore} → {player.eloAfter}
                        </span>
                        <span 
                          className={`font-medium ${
                            player.eloChange > 0 
                              ? 'text-green-600' 
                              : player.eloChange < 0 
                                ? 'text-red-600' 
                                : ''
                          }`}
                        >
                          {player.eloChange > 0 ? '+' : ''}
                          {player.eloChange}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchHistory;