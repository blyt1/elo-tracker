'use client';

import { useState } from 'react';
import { addPlayer } from '@/lib/supabase';
import toast from 'react-hot-toast';

const AddPlayerForm = ({ onPlayerAdded }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a player name');
      return;
    }

    setIsSubmitting(true);
    try {
      const newPlayer = await addPlayer(name);
      toast.success(`Added ${name} to the roster`);
      setName('');
      if (onPlayerAdded) {
        onPlayerAdded(newPlayer);
      }
    } catch (error) {
      console.error('Error adding player:', error);
      toast.error('Failed to add player');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Add New Player</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="playerName" className="label">
            Player Name
          </label>
          <input
            id="playerName"
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter player name"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Player'}
        </button>
      </form>
    </div>
  );
};

export default AddPlayerForm;
