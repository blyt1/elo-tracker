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
    <div>
      <h1>Players</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <AddPlayerForm onPlayerAdded={handlePlayerAdded} />
        </div>
        <div className="md:col-span-2">
          <PlayersList players={players} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
