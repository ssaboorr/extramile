import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { PlayerData, getPlayerData, updatePlayerStats, updatePlayerPreferences } from '../firebase/collections';

export const usePlayer = (user: User | null) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPlayerData();
    } else {
      setPlayerData(null);
      setError(null);
    }
  }, [user]);

  const loadPlayerData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getPlayerData(user.uid);
      setPlayerData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load player data');
      console.error('Error loading player data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (stats: Partial<PlayerData>) => {
    if (!user || !playerData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await updatePlayerStats(user.uid, stats);
      // Reload player data to get updated values
      await loadPlayerData();
    } catch (err: any) {
      setError(err.message || 'Failed to update player stats');
      console.error('Error updating player stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (preferences: Partial<PlayerData['preferences']>) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await updatePlayerPreferences(user.uid, preferences);
      // Update local state
      if (playerData) {
        setPlayerData({
          ...playerData,
          preferences: { ...playerData.preferences, ...preferences },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
      console.error('Error updating preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshPlayerData = () => {
    if (user) {
      loadPlayerData();
    }
  };

  return {
    playerData,
    loading,
    error,
    updateStats,
    updatePreferences,
    refreshPlayerData,
  };
};
