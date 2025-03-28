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
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.5rem', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
      overflow: 'hidden',
      border: '1px solid #dbeafe'
    }}>
      <div style={{ 
        backgroundColor: '#2563eb', 
        padding: '1rem' 
      }}>
        <h2 style={{ 
          color: 'white', 
          fontWeight: 'bold', 
          fontSize: '1.25rem' 
        }}>Add New Player</h2>
        <p style={{ 
          color: '#bfdbfe', 
          fontSize: '0.875rem', 
          marginTop: '0.25rem' 
        }}>Create a new player profile</p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label 
            htmlFor="playerName" 
            style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.25rem'
            }}
          >
            Player Name
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="playerName"
              type="text"
              style={{ 
                width: '100%', 
                padding: '0.5rem 1rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem',
                outline: 'none'
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter player name"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <button
          type="submit"
          style={{ 
            width: '100%', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.375rem', 
            fontWeight: '500', 
            color: 'white',
            backgroundColor: isSubmitting ? '#60a5fa' : '#2563eb',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            border: 'none'
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Player'}
        </button>
      </form>
    </div>
  );
};

export default AddPlayerForm;