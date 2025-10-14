import { 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  getDoc, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { User } from 'firebase/auth';

// ============================================================================
// COLLECTION TYPES & INTERFACES
// ============================================================================

export interface PlayerData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAnonymous: boolean;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  loginCount: number;
  totalGamesPlayed: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
  gamesWon: number;
  winRate: number;
  totalPlayTime: number; // in minutes
  currentStreak: number;
  bestStreak: number;
  level: number;
  experience: number;
  achievements: string[];
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    language: string;
  };
  stats: {
    fastestCompletion: number; // in seconds
    mostAccurateGame: number; // percentage
    favoriteGameType: string;
    lastPlayedAt?: Timestamp;
  };
}

export interface RoomData {
  roomId: string;
  hostId: string;
  hostName: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  gameType: string;
  maxPlayers: number;
  currentPlayers: number;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  settings: {
    timeLimit: number; // in minutes
    difficulty: 'easy' | 'medium' | 'hard';
    allowSpectators: boolean;
    isPrivate: boolean;
  };
  results?: {
    winnerId: string;
    winnerName: string;
    topScores: Array<{
      playerId: string;
      playerName: string;
      score: number;
    }>;
  };
}

export interface GameData {
  gameId: string;
  roomId: string;
  playerId: string;
  playerName: string;
  gameType: string;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  score: number;
  accuracy: number;
  timeSpent: number; // in seconds
  puzzlesCompleted: number;
  totalPuzzles: number;
  difficulty: string;
  rank?: number;
  isCompleted: boolean;
  answers: Array<{
    puzzleId: string;
    answer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'score' | 'streak' | 'games' | 'time' | 'special';
  requirement: {
    type: string;
    value: number;
    condition: 'greater_than' | 'equal_to' | 'less_than';
  };
  reward: {
    experience: number;
    title?: string;
  };
  unlockedAt?: Timestamp;
}

// ============================================================================
// PLAYER COLLECTION HELPERS
// ============================================================================

export const createOrUpdatePlayer = async (user: User): Promise<void> => {
  const playerRef = doc(db, 'players', user.uid);
  const playerSnap = await getDoc(playerRef);

  const now = serverTimestamp();
  
  if (playerSnap.exists()) {
    // Update existing player
    await updateDoc(playerRef, {
      lastLoginAt: now,
      loginCount: increment(1),
      displayName: user.displayName || playerSnap.data().displayName,
      email: user.email || playerSnap.data().email,
      photoURL: user.photoURL || playerSnap.data().photoURL,
      isAnonymous: user.isAnonymous,
    });
  } else {
    // Create new player
    const newPlayerData: Omit<PlayerData, 'createdAt' | 'lastLoginAt'> = {
      uid: user.uid,
      displayName: user.displayName || 'Guest Player',
      email: user.email || '',
      photoURL: user.photoURL || undefined,
      isAnonymous: user.isAnonymous,
      loginCount: 1,
      totalGamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      averageScore: 0,
      gamesWon: 0,
      winRate: 0,
      totalPlayTime: 0,
      currentStreak: 0,
      bestStreak: 0,
      level: 1,
      experience: 0,
      achievements: [],
      preferences: {
        theme: 'auto',
        soundEnabled: true,
        notificationsEnabled: true,
        language: 'en',
      },
      stats: {
        fastestCompletion: 0,
        mostAccurateGame: 0,
        favoriteGameType: '',
      },
    };

    await setDoc(playerRef, {
      ...newPlayerData,
      createdAt: now,
      lastLoginAt: now,
    });
  }
};

export const getPlayerData = async (uid: string): Promise<PlayerData | null> => {
  const playerRef = doc(db, 'players', uid);
  const playerSnap = await getDoc(playerRef);
  
  if (playerSnap.exists()) {
    return playerSnap.data() as PlayerData;
  }
  return null;
};

export const updatePlayerStats = async (
  uid: string, 
  stats: Partial<Pick<PlayerData, 'totalGamesPlayed' | 'totalScore' | 'bestScore' | 'gamesWon' | 'totalPlayTime' | 'currentStreak' | 'bestStreak' | 'experience' | 'level' | 'achievements'>>
): Promise<void> => {
  const playerRef = doc(db, 'players', uid);
  
  // Calculate derived stats
  const playerData = await getPlayerData(uid);
  if (!playerData) return;

  const updates: any = {};
  
  if (stats.totalGamesPlayed !== undefined) {
    updates.totalGamesPlayed = stats.totalGamesPlayed;
    // Update average score
    if (stats.totalScore !== undefined) {
      updates.averageScore = stats.totalGamesPlayed > 0 ? stats.totalScore / stats.totalGamesPlayed : 0;
    }
    // Update win rate
    if (stats.gamesWon !== undefined) {
      updates.winRate = stats.totalGamesPlayed > 0 ? (stats.gamesWon / stats.totalGamesPlayed) * 100 : 0;
    }
  }

  // Update other stats
  Object.keys(stats).forEach(key => {
    if (stats[key as keyof typeof stats] !== undefined) {
      updates[key] = stats[key as keyof typeof stats];
    }
  });

  await updateDoc(playerRef, updates);
};

export const updatePlayerPreferences = async (
  uid: string, 
  preferences: Partial<PlayerData['preferences']>
): Promise<void> => {
  const playerRef = doc(db, 'players', uid);
  await updateDoc(playerRef, {
    [`preferences.${Object.keys(preferences)[0]}`]: Object.values(preferences)[0],
  });
};

// ============================================================================
// ROOM COLLECTION HELPERS
// ============================================================================

export const createRoom = async (hostId: string, gameType: string = 'mixed'): Promise<string> => {
  const roomId = generateRoomCode();
  const roomRef = doc(db, 'rooms', roomId);
  
  // Get host data
  const hostData = await getPlayerData(hostId);
  
  const roomData: Omit<RoomData, 'createdAt'> = {
    roomId,
    hostId,
    hostName: hostData?.displayName || 'Unknown Host',
    status: 'waiting',
    gameType,
    maxPlayers: 8,
    currentPlayers: 1,
    settings: {
      timeLimit: 30,
      difficulty: 'medium',
      allowSpectators: true,
      isPrivate: false,
    },
  };

  await setDoc(roomRef, {
    ...roomData,
    createdAt: serverTimestamp(),
  });

  return roomId;
};

export const joinRoom = async (roomId: string, playerId: string): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }

  const roomData = roomSnap.data() as RoomData;
  
  if (roomData.status !== 'waiting') {
    throw new Error('Room is not accepting new players');
  }

  if (roomData.currentPlayers >= roomData.maxPlayers) {
    throw new Error('Room is full');
  }

  // Add player to room
  const playerRef = doc(db, 'rooms', roomId, 'players', playerId);
  const playerData = await getPlayerData(playerId);
  
  await setDoc(playerRef, {
    playerId,
    displayName: playerData?.displayName || 'Guest',
    email: playerData?.email || '',
    photoURL: playerData?.photoURL || '',
    joinedAt: serverTimestamp(),
    totalScore: 0,
    isHost: false,
  });

  // Update room player count
  await updateDoc(roomRef, {
    currentPlayers: increment(1),
  });
};

export const startRoom = async (roomId: string): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    status: 'active',
    startedAt: serverTimestamp(),
  });
};

export const endRoom = async (
  roomId: string, 
  results: RoomData['results']
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    status: 'completed',
    endedAt: serverTimestamp(),
    results,
  });
};

// ============================================================================
// GAME COLLECTION HELPERS
// ============================================================================

export const createGameRecord = async (gameData: Omit<GameData, 'gameId' | 'startedAt'>): Promise<string> => {
  const gamesRef = collection(db, 'games');
  const gameDoc = await addDoc(gamesRef, {
    ...gameData,
    startedAt: serverTimestamp(),
  });
  
  return gameDoc.id;
};

export const updateGameRecord = async (
  gameId: string, 
  updates: Partial<Pick<GameData, 'endedAt' | 'score' | 'accuracy' | 'timeSpent' | 'puzzlesCompleted' | 'isCompleted' | 'rank' | 'answers'>>
): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, updates);
};

export const getPlayerGames = async (
  playerId: string, 
  limitCount: number = 10
): Promise<GameData[]> => {
  const gamesRef = collection(db, 'games');
  const q = query(
    gamesRef,
    where('playerId', '==', playerId),
    orderBy('startedAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ gameId: doc.id, ...doc.data() } as GameData));
};

export const getRoomGames = async (roomId: string): Promise<GameData[]> => {
  const gamesRef = collection(db, 'games');
  const q = query(
    gamesRef,
    where('roomId', '==', roomId),
    orderBy('score', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ gameId: doc.id, ...doc.data() } as GameData));
};

// ============================================================================
// LEADERBOARD HELPERS
// ============================================================================

export const getGlobalLeaderboard = async (limitCount: number = 50): Promise<PlayerData[]> => {
  const playersRef = collection(db, 'players');
  const q = query(
    playersRef,
    orderBy('totalScore', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as PlayerData);
};

export const getWeeklyLeaderboard = async (limitCount: number = 50): Promise<any[]> => {
  // This would require a separate collection for weekly stats
  // For now, return global leaderboard
  return getGlobalLeaderboard(limitCount);
};

// ============================================================================
// ACHIEVEMENT HELPERS
// ============================================================================

export const checkAndUnlockAchievements = async (playerId: string): Promise<string[]> => {
  const playerData = await getPlayerData(playerId);
  if (!playerData) return [];

  const achievementsRef = collection(db, 'achievements');
  const achievementsSnap = await getDocs(achievementsRef);
  
  const unlockedAchievements: string[] = [];
  
  for (const achievementDoc of achievementsSnap.docs) {
    const achievement = achievementDoc.data() as AchievementData;
    
    // Skip if already unlocked
    if (playerData.achievements.includes(achievement.id)) continue;
    
    // Check if requirement is met
    const requirement = achievement.requirement;
    let playerValue: number;
    
    switch (requirement.type) {
      case 'totalScore':
        playerValue = playerData.totalScore;
        break;
      case 'gamesPlayed':
        playerValue = playerData.totalGamesPlayed;
        break;
      case 'winRate':
        playerValue = playerData.winRate;
        break;
      case 'currentStreak':
        playerValue = playerData.currentStreak;
        break;
      default:
        continue;
    }
    
    let isUnlocked = false;
    switch (requirement.condition) {
      case 'greater_than':
        isUnlocked = playerValue > requirement.value;
        break;
      case 'equal_to':
        isUnlocked = playerValue === requirement.value;
        break;
      case 'less_than':
        isUnlocked = playerValue < requirement.value;
        break;
    }
    
    if (isUnlocked) {
      // Add achievement to player
      const playerRef = doc(db, 'players', playerId);
      await updateDoc(playerRef, {
        achievements: [...playerData.achievements, achievement.id],
        experience: increment(achievement.reward.experience),
      });
      
      unlockedAchievements.push(achievement.name);
    }
  }
  
  return unlockedAchievements;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const calculateExperience = (score: number, timeSpent: number, accuracy: number): number => {
  // Base experience from score
  let exp = Math.floor(score / 10);
  
  // Bonus for fast completion
  if (timeSpent < 300) { // Less than 5 minutes
    exp += Math.floor(exp * 0.2);
  }
  
  // Bonus for high accuracy
  if (accuracy > 90) {
    exp += Math.floor(exp * 0.3);
  }
  
  return Math.max(exp, 1); // Minimum 1 experience point
};

export const calculateLevel = (experience: number): number => {
  // Level progression: 100 * level^1.5
  let level = 1;
  let expNeeded = 0;
  
  while (expNeeded <= experience) {
    level++;
    expNeeded += Math.floor(100 * Math.pow(level, 1.5));
  }
  
  return level - 1;
};
