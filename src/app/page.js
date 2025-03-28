'use client';

import { useState, useEffect } from 'react';
import AddPlayerForm from '@/components/AddPlayerForm';
import PlayersList from '@/components/PlayersList';
import { getPlayers } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlayers = async () => {
    setIsLoading(true);
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

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handlePlayerAdded = (newPlayer) => {
    setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
  };

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Content Container */}
      <div>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr', 
            gap: '2rem',
            '@media (min-width: 768px)': {
              gridTemplateColumns: '1fr 2fr'
            }
          }}>
            <div className="md:col-span-1">
              <div>
                <AddPlayerForm onPlayerAdded={handlePlayerAdded} />
              </div>
            </div>
            <div className="md:col-span-2">
              <PlayersList players={players} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}