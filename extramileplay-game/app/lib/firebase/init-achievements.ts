import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './config';
import { AchievementData } from './collections';

const achievements: Omit<AchievementData, 'unlockedAt'>[] = [
  // Score Achievements
  {
    id: 'first_score',
    name: 'Getting Started',
    description: 'Score your first points',
    icon: '🎯',
    category: 'score',
    requirement: {
      type: 'totalScore',
      value: 1,
      condition: 'greater_than',
    },
    reward: {
      experience: 10,
    },
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Score 100 points in total',
    icon: '💯',
    category: 'score',
    requirement: {
      type: 'totalScore',
      value: 100,
      condition: 'greater_than',
    },
    reward: {
      experience: 50,
    },
  },
  {
    id: 'thousand_club',
    name: 'Thousand Club',
    description: 'Score 1,000 points in total',
    icon: '🔥',
    category: 'score',
    requirement: {
      type: 'totalScore',
      value: 1000,
      condition: 'greater_than',
    },
    reward: {
      experience: 200,
    },
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Score 10,000 points in total',
    icon: '💎',
    category: 'score',
    requirement: {
      type: 'totalScore',
      value: 10000,
      condition: 'greater_than',
    },
    reward: {
      experience: 500,
    },
  },

  // Games Played Achievements
  {
    id: 'rookie',
    name: 'Rookie',
    description: 'Play your first game',
    icon: '🌱',
    category: 'games',
    requirement: {
      type: 'gamesPlayed',
      value: 1,
      condition: 'greater_than',
    },
    reward: {
      experience: 25,
    },
  },
  {
    id: 'dedicated',
    name: 'Dedicated Player',
    description: 'Play 10 games',
    icon: '🎮',
    category: 'games',
    requirement: {
      type: 'gamesPlayed',
      value: 10,
      condition: 'greater_than',
    },
    reward: {
      experience: 100,
    },
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play 50 games',
    icon: '🏆',
    category: 'games',
    requirement: {
      type: 'gamesPlayed',
      value: 50,
      condition: 'greater_than',
    },
    reward: {
      experience: 300,
    },
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Play 100 games',
    icon: '👑',
    category: 'games',
    requirement: {
      type: 'gamesPlayed',
      value: 100,
      condition: 'greater_than',
    },
    reward: {
      experience: 750,
    },
  },

  // Streak Achievements
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Win 3 games in a row',
    icon: '🔥',
    category: 'streak',
    requirement: {
      type: 'currentStreak',
      value: 3,
      condition: 'greater_than',
    },
    reward: {
      experience: 150,
    },
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Win 5 games in a row',
    icon: '⚡',
    category: 'streak',
    requirement: {
      type: 'currentStreak',
      value: 5,
      condition: 'greater_than',
    },
    reward: {
      experience: 300,
    },
  },
  {
    id: 'dominant',
    name: 'Dominant',
    description: 'Win 10 games in a row',
    icon: '💥',
    category: 'streak',
    requirement: {
      type: 'currentStreak',
      value: 10,
      condition: 'greater_than',
    },
    reward: {
      experience: 600,
    },
  },

  // Win Rate Achievements
  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Maintain 50% win rate',
    icon: '📊',
    category: 'score',
    requirement: {
      type: 'winRate',
      value: 50,
      condition: 'greater_than',
    },
    reward: {
      experience: 200,
    },
  },
  {
    id: 'excellent',
    name: 'Excellent',
    description: 'Maintain 75% win rate',
    icon: '⭐',
    category: 'score',
    requirement: {
      type: 'winRate',
      value: 75,
      condition: 'greater_than',
    },
    reward: {
      experience: 400,
    },
  },
  {
    id: 'perfect',
    name: 'Perfect',
    description: 'Maintain 90% win rate',
    icon: '🌟',
    category: 'score',
    requirement: {
      type: 'winRate',
      value: 90,
      condition: 'greater_than',
    },
    reward: {
      experience: 800,
    },
  },

  // Special Achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Play your first game',
    icon: '🐦',
    category: 'special',
    requirement: {
      type: 'gamesPlayed',
      value: 1,
      condition: 'equal_to',
    },
    reward: {
      experience: 50,
      title: 'Early Bird',
    },
  },
  {
    id: 'social_player',
    name: 'Social Player',
    description: 'Join your first multiplayer room',
    icon: '👥',
    category: 'special',
    requirement: {
      type: 'gamesPlayed',
      value: 1,
      condition: 'greater_than',
    },
    reward: {
      experience: 100,
    },
  },
];

export const initializeAchievements = async (): Promise<void> => {
  try {
    const achievementsRef = collection(db, 'achievements');
    
    for (const achievement of achievements) {
      const achievementRef = doc(achievementsRef, achievement.id);
      await setDoc(achievementRef, achievement);
    }
    
    console.log('Achievements initialized successfully');
  } catch (error) {
    console.error('Error initializing achievements:', error);
    throw error;
  }
};

// Function to call this once in your app initialization
export const setupFirestore = async (): Promise<void> => {
  try {
    await initializeAchievements();
    console.log('Firestore setup completed');
  } catch (error) {
    console.error('Error setting up Firestore:', error);
  }
};
