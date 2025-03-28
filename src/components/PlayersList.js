'use client';

import { useState } from 'react';
import { calculateConservativeRating } from '@/lib/trueskill';

const PlayersList = ({ players, isLoading }) => {
  const [sortBy, setSortBy] = useState('rating'); // Default sort by rating
  const [sortOrder, setSortOrder] = useState('desc'); // Default descending order
  
  // Function to handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle order if already sorting by this field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  const getUncertaintyDots = (player) => {
    if (player.sigma === undefined) return null;
    
    // Higher sigma means more uncertainty
    if (player.sigma > 200) {
      return (
        <span title="Very high uncertainty" className="ml-1 inline-flex space-x-0.5">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </span>
      );
    } else if (player.sigma > 100) {
      return (
        <span title="High uncertainty" className="ml-1 inline-flex space-x-0.5">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
        </span>
      );
    } else if (player.sigma > 50) {
      return (
        <span title="Moderate uncertainty" className="ml-1 inline-flex">
          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
        </span>
      );
    }
    return null;
  };

  const getWinRateBar = (wins, losses) => {
    const games = wins + losses;
    const rate = games > 0 ? Math.round((wins / games) * 100) : 0;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full ${getRateColor(rate)}`} 
          style={{ width: `${rate}%` }}
          aria-valuenow={rate}
          aria-valuemin="0"
          aria-valuemax="100"
          role="progressbar"
        ></div>
      </div>
    );
  };

  const getRateColor = (rate) => {
    if (rate >= 70) return 'bg-green-500';
    if (rate >= 50) return 'bg-blue-500';
    if (rate >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem'
      }}>
        <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <div style={{ 
            height: '2rem', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '0.25rem', 
            width: '25%', 
            marginBottom: '1.5rem' 
          }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ 
                  height: '1.5rem', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '0.25rem', 
                  width: '33%' 
                }}></div>
                <div style={{ 
                  height: '1.5rem', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '0.25rem', 
                  width: '16%' 
                }}></div>
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
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        textAlign: 'center',
        border: '1px solid #dbeafe'
      }}>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          No players found. Add your first player!
        </p>
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

  // Sort players based on current sort settings
  const sortedPlayers = [...players].sort((a, b) => {
    // For string comparisons
    if (sortBy === 'name') {
      const aValue = a.name ? a.name.toLowerCase() : '';
      const bValue = b.name ? b.name.toLowerCase() : '';
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // For numeric comparisons
    let aValue = 0;
    let bValue = 0;
    
    if (sortBy === 'winrate') {
      aValue = a.games_played > 0 ? (a.wins / a.games_played) : 0;
      bValue = b.games_played > 0 ? (b.wins / b.games_played) : 0;
    }
    else if (sortBy === 'games') {
      aValue = a.games_played || 0;
      bValue = b.games_played || 0;
    }
    else { // Default: rating
      aValue = getConservativeRating(a) || 0;
      bValue = getConservativeRating(b) || 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Table header sort button
  const SortButton = ({ label, field }) => {
    const isCurrent = sortBy === field;
    return (
      <button 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.25rem',
          fontWeight: '600',
          color: isCurrent ? '#1d4ed8' : '#374151',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0
        }}
        onClick={() => handleSort(field)}
      >
        <span>{label}</span>
        <span style={{ 
          color: isCurrent ? '#1d4ed8' : '#9ca3af',
          transition: 'transform 0.2s'
        }}>
          {isCurrent ? (
            sortOrder === 'asc' ? '↑' : '↓'
          ) : (
            '↓'
          )}
        </span>
      </button>
    );
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.5rem', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
      overflow: 'hidden',
      border: '1px solid #dbeafe'
    }}>
      <div style={{ 
        background: '#2563eb', 
        padding: '1rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>Player Rankings</h2>
        <div style={{ color: '#bfdbfe', fontSize: '0.875rem' }}>
          {sortedPlayers.length} player{sortedPlayers.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ 
                padding: '0.75rem 1.5rem', 
                textAlign: 'left', 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                color: '#6b7280', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}>
                Rank
              </th>
              <th style={{ 
                padding: '0.75rem 1.5rem', 
                textAlign: 'left', 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                color: '#6b7280', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}>
                <SortButton label="Player" field="name" />
              </th>
              <th style={{ 
                padding: '0.75rem 1.5rem', 
                textAlign: 'left', 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                color: '#6b7280', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}>
                <SortButton label="Rating" field="rating" />
              </th>
              <th style={{ 
                padding: '0.75rem 1.5rem', 
                textAlign: 'left', 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                color: '#6b7280', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}>
                <SortButton label="Win/Loss" field="winrate" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, idx) => {
              const rating = getConservativeRating(player);
              const winRate = player.games_played > 0 
                ? Math.round((player.wins / player.games_played) * 100)
                : 0;
              
              // Get color for rating
              let ratingColor = '#ef4444'; // red
              if (rating >= 1200) ratingColor = '#16a34a'; // green
              else if (rating >= 1000) ratingColor = '#2563eb'; // blue
              else if (rating >= 800) ratingColor = '#ca8a04'; // yellow
                
              return (
                <tr key={player.id} style={{ 
                  borderBottom: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s'
                }}>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {idx < 3 ? (
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          width: '2rem', 
                          height: '2rem', 
                          borderRadius: '9999px', 
                          fontWeight: 'bold', 
                          color: 'white',
                          backgroundColor: idx === 0 ? '#facc15' : idx === 1 ? '#94a3b8' : '#b45309' 
                        }}>
                          {idx + 1}
                        </span>
                      ) : (
                        <span style={{ 
                          color: '#6b7280', 
                          fontWeight: '500', 
                          padding: '0 0.5rem' 
                        }}>
                          {idx + 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ 
                      fontWeight: '500', 
                      color: '#111827',
                      textTransform: 'capitalize' 
                    }}>
                      {player.name}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: ratingColor }}>
                        {rating}
                      </span>
                      {getUncertaintyDots(player)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#111827' }}>
                        {player.wins}-{player.losses} 
                        <span style={{ 
                          marginLeft: '0.5rem', 
                          display: 'inline-block', 
                          padding: '0.25rem 0.5rem', 
                          fontSize: '0.75rem', 
                          fontWeight: '600', 
                          borderRadius: '9999px',
                          backgroundColor: winRate >= 70 ? 'rgba(22, 163, 74, 0.1)' : 
                                         winRate >= 50 ? 'rgba(37, 99, 235, 0.1)' : 
                                         winRate >= 30 ? 'rgba(202, 138, 4, 0.1)' : 
                                         'rgba(239, 68, 68, 0.1)',
                          color: winRate >= 70 ? '#15803d' : 
                                 winRate >= 50 ? '#1d4ed8' : 
                                 winRate >= 30 ? '#a16207' : 
                                 '#b91c1c'
                        }}>
                          {winRate}%
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: '9999px', 
                        height: '0.625rem', 
                        marginTop: '0.25rem',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          height: '0.625rem', 
                          borderRadius: '9999px',
                          width: `${winRate}%`,
                          backgroundColor: winRate >= 70 ? '#16a34a' : 
                                         winRate >= 50 ? '#2563eb' : 
                                         winRate >= 30 ? '#ca8a04' : 
                                         '#ef4444'
                        }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ 
        backgroundColor: '#f9fafb', 
        padding: '1rem', 
        borderTop: '1px solid #e5e7eb', 
        fontSize: '0.75rem', 
        color: '#4b5563' 
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: '500' }}>Rating System:</span> μ - 3σ (conservative estimate)
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayersList;