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
    Timestamp,
    runTransaction,
    writeBatch,
    arrayUnion,
    arrayRemove
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
    playerIds: string[]; // Array of player IDs in the room
    createdAt: Timestamp;
    startedAt?: Timestamp;
    endedAt?: Timestamp;
    currentChallengeIndex: number;
    totalChallenges: number;
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
  
  export interface RoomPlayerData {
    playerId: string;
    displayName: string;
    email: string;
    photoURL: string;
    joinedAt: Timestamp;
    totalScore: number;
    isHost: boolean;
    currentChallengeIndex: number;
    completedChallenges: string[];
    isReady: boolean;
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
    playerIds: string[]; // For security rules
    hostId: string; // For security rules
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
    if (!user || !user.uid) {
      throw new Error('Invalid user object');
    }
  
    const playerRef = doc(db, 'players', user.uid);
    
    try {
      const playerSnap = await getDoc(playerRef);
      const now = serverTimestamp();
      
      if (playerSnap.exists()) {
        // Update existing player
        await updateDoc(playerRef, {
          lastLoginAt: now,
          loginCount: increment(1),
          displayName: user.displayName || playerSnap.data().displayName,
          email: user.email || playerSnap.data().email,
          photoURL: user.photoURL || playerSnap.data().photoURL || '',
          isAnonymous: user.isAnonymous,
        });
      } else {
        // Create new player
        const newPlayerData = {
          uid: user.uid,
          displayName: user.displayName || 'Guest Player',
          email: user.email || '',
          photoURL: user.photoURL || '',
          isAnonymous: user.isAnonymous,
          createdAt: now,
          lastLoginAt: now,
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
  
        await setDoc(playerRef, newPlayerData);
      }
    } catch (error: any) {
      console.error('Error creating/updating player:', error);
      throw new Error(`Failed to create/update player: ${error.message}`);
    }
  };
  
  export const getPlayerData = async (uid: string): Promise<PlayerData | null> => {
    try {
      const playerRef = doc(db, 'players', uid);
      const playerSnap = await getDoc(playerRef);
      
      if (playerSnap.exists()) {
        return playerSnap.data() as PlayerData;
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching player data:', error);
      return null;
    }
  };
  
  export const updatePlayerStats = async (
    uid: string, 
    stats: Partial<Pick<PlayerData, 'totalGamesPlayed' | 'totalScore' | 'bestScore' | 'gamesWon' | 'totalPlayTime' | 'currentStreak' | 'bestStreak' | 'experience' | 'level' | 'achievements'>>
  ): Promise<void> => {
    const playerRef = doc(db, 'players', uid);
    
    try {
      const playerData = await getPlayerData(uid);
      if (!playerData) {
        throw new Error('Player not found');
      }
  
      const updates: any = {};
      
      // Calculate derived stats
      if (stats.totalGamesPlayed !== undefined) {
        updates.totalGamesPlayed = stats.totalGamesPlayed;
        
        // Update average score
        if (stats.totalScore !== undefined) {
          updates.totalScore = stats.totalScore;
          updates.averageScore = stats.totalGamesPlayed > 0 
            ? Math.round(stats.totalScore / stats.totalGamesPlayed) 
            : 0;
        }
        
        // Update win rate
        if (stats.gamesWon !== undefined) {
          updates.gamesWon = stats.gamesWon;
          updates.winRate = stats.totalGamesPlayed > 0 
            ? Math.round((stats.gamesWon / stats.totalGamesPlayed) * 100) 
            : 0;
        }
      }
  
      // Update other stats
      Object.keys(stats).forEach(key => {
        if (stats[key as keyof typeof stats] !== undefined && !updates[key]) {
          updates[key] = stats[key as keyof typeof stats];
        }
      });
  
      await updateDoc(playerRef, updates);
    } catch (error: any) {
      console.error('Error updating player stats:', error);
      throw new Error(`Failed to update player stats: ${error.message}`);
    }
  };
  
  export const updatePlayerPreferences = async (
    uid: string, 
    preferences: Partial<PlayerData['preferences']>
  ): Promise<void> => {
    const playerRef = doc(db, 'players', uid);
    
    try {
      const updates: any = {};
      Object.entries(preferences).forEach(([key, value]) => {
        updates[`preferences.${key}`] = value;
      });
      
      await updateDoc(playerRef, updates);
    } catch (error: any) {
      console.error('Error updating player preferences:', error);
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
  };
  
  // ============================================================================
  // ROOM COLLECTION HELPERS
  // ============================================================================
  
  export const createRoom = async (
    hostId: string, 
    gameType: string = 'mixed'
  ): Promise<string> => {
    try {
      const roomId = generateRoomCode();
      const roomRef = doc(db, 'rooms', roomId);
      
      // Get host data
      const hostData = await getPlayerData(hostId);
      if (!hostData) {
        throw new Error('Host player data not found');
      }
      
      const roomData: RoomData = {
        roomId,
        hostId,
        hostName: hostData.displayName || 'Unknown Host',
        status: 'waiting',
        gameType,
        maxPlayers: 8,
        currentPlayers: 1,
        playerIds: [hostId], // Initialize with host ID
        currentChallengeIndex: 0,
        totalChallenges: 4,
        createdAt: serverTimestamp() as Timestamp,
        settings: {
          timeLimit: 30,
          difficulty: 'medium',
          allowSpectators: true,
          isPrivate: false,
        },
      };
  
      // Use transaction to create room and add host as player atomically
      await runTransaction(db, async (transaction) => {
        // Create room document
        transaction.set(roomRef, roomData);
        
        // Add host as first player in subcollection
        const hostPlayerRef = doc(db, 'rooms', roomId, 'players', hostId);
        transaction.set(hostPlayerRef, {
          playerId: hostId,
          displayName: hostData.displayName,
          email: hostData.email || '',
          photoURL: hostData.photoURL || '',
          joinedAt: serverTimestamp(),
          totalScore: 0,
          isHost: true,
          currentChallengeIndex: 0,
          completedChallenges: [],
          isReady: true,
        });
      });
  
      console.log(`✅ Room created: ${roomId}`);

      // After creating the room, fetch available templates (easy/medium/hard)
      try {
        const templatesRef = collection(db, 'gameTemplates');
        const difficulties = ['easy', 'medium', 'hard'];
        const sessions: any[] = [];

        for (const diff of difficulties) {
          const q = query(templatesRef, where('difficulty', '==', diff), limit(1));
          const snaps = await getDocs(q);
          if (!snaps.empty) {
            const docSnap = snaps.docs[0];
            const d = docSnap.data() as any;
            sessions.push({ templateId: docSnap.id, difficulty: diff, challenges: d.challenges || [] });
          }
        }

        if (sessions.length > 0) {
          await updateDoc(roomRef, { templatesAvailable: sessions });
          console.log('Attached available templates to room:', roomId, sessions.map(s=>s.templateId));
          // Also log the full sessions payload for debugging when rooms are created
          console.log('[createRoom] sessions payload:', JSON.stringify(sessions, null, 2));
        }
      } catch (err) {
        console.warn('Could not attach templates to room:', err);
      }
      return roomId;
    } catch (error: any) {
      console.error('Error creating room:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  };
  
  export const joinRoom = async (
    roomCode: string, 
    playerId: string
  ): Promise<void> => {
    if (!roomCode || !playerId) {
      throw new Error('Room code and player ID are required');
    }
  
    const roomRef = doc(db, 'rooms', roomCode);
    
    try {
      // Use transaction for atomic operations
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        
        if (!roomSnap.exists()) {
          throw new Error('Room not found');
        }
  
        const roomData = roomSnap.data() as RoomData;
        
        // Validate room status
        if (roomData.status !== 'waiting') {
          throw new Error('Room is not accepting new players. Game has already started.');
        }
  
        // Check if room is full
        if (roomData.currentPlayers >= roomData.maxPlayers) {
          throw new Error(`Room is full (${roomData.maxPlayers}/${roomData.maxPlayers} players)`);
        }
  
        // Check if player already in room using playerIds array
        if (roomData.playerIds && roomData.playerIds.includes(playerId)) {
          throw new Error('You are already in this room');
        }
  
        // Get player data
        const playerData = await getPlayerData(playerId);
        if (!playerData) {
          throw new Error('Player data not found');
        }
        
        // Add player to room subcollection
        const playerRef = doc(db, 'rooms', roomCode, 'players', playerId);
        transaction.set(playerRef, {
          playerId,
          displayName: playerData.displayName,
          email: playerData.email || '',
          photoURL: playerData.photoURL || '',
          joinedAt: serverTimestamp(),
          totalScore: 0,
          isHost: false,
          currentChallengeIndex: 0,
          completedChallenges: [],
          isReady: false,
        });
  
        // Update room: increment player count AND add to playerIds array
        transaction.update(roomRef, {
          currentPlayers: increment(1),
          playerIds: arrayUnion(playerId)
        });
      });
      
      console.log(`✅ Player ${playerId} joined room: ${roomCode}`);
    } catch (error: any) {
      console.error('❌ Error joining room:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('not found')) {
        throw new Error('Room not found. Please check the room code.');
      } else if (error.message.includes('permission-denied')) {
        throw new Error('Permission denied. Please check your login status.');
      } else if (error.message.includes('unavailable')) {
        throw new Error('Service temporarily unavailable. Please try again.');
      }
      
      throw error;
    }
  };
  
  export const leaveRoom = async (
    roomCode: string, 
    playerId: string
  ): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    
    try {
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        
        if (!roomSnap.exists()) {
          throw new Error('Room not found');
        }
  
        const roomData = roomSnap.data() as RoomData;
  
        // Check if player is in the playerIds array
        if (!roomData.playerIds || !roomData.playerIds.includes(playerId)) {
          throw new Error('Player not in room');
        }
  
        const playerRef = doc(db, 'rooms', roomCode, 'players', playerId);
        const playerSnap = await transaction.get(playerRef);
        
        if (!playerSnap.exists()) {
          throw new Error('Player not in room');
        }
  
        // Remove player from room subcollection
        transaction.delete(playerRef);
        
        // Update room: decrement player count AND remove from playerIds array
        transaction.update(roomRef, {
          currentPlayers: increment(-1),
          playerIds: arrayRemove(playerId)
        });
      });
      
      console.log(`✅ Player ${playerId} left room: ${roomCode}`);
    } catch (error: any) {
      console.error('Error leaving room:', error);
      throw new Error(`Failed to leave room: ${error.message}`);
    }
  };
  
  export const startRoom = async (roomId: string, hostId: string): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomId);
    
    try {
      let playerIds: string[] = [];
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        
        if (!roomSnap.exists()) {
          throw new Error('Room not found');
        }

        const roomData = roomSnap.data() as RoomData;
        
        // Verify host
        if (roomData.hostId !== hostId) {
          throw new Error('Only the host can start the game');
        }

        // Check if room has players
        if (roomData.currentPlayers < 1) {
          throw new Error('Cannot start game with no players');
        }

        playerIds = roomData.playerIds || [];

        transaction.update(roomRef, {
          status: 'active',
          startedAt: serverTimestamp(),
        });
      });

      // After transaction, add roomId to each player's profile (activeRooms)
      for (const pid of playerIds) {
        try {
          const playerRef = doc(db, 'players', pid);
          await updateDoc(playerRef, {
            // store active rooms for player
            activeRooms: arrayUnion(roomId)
          });
        } catch (err) {
          console.warn(`Could not add room to player ${pid}:`, err);
        }
      }

      console.log(`✅ Room ${roomId} started and players updated`);
    } catch (error: any) {
      console.error('Error starting room:', error);
      throw new Error(`Failed to start room: ${error.message}`);
    }
  };
  
  export const endRoom = async (
    roomId: string, 
    results: RoomData['results']
  ): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomId);
    
    try {
      await updateDoc(roomRef, {
        status: 'completed',
        endedAt: serverTimestamp(),
        results,
      });
      
      console.log(`✅ Room ${roomId} ended`);
    } catch (error: any) {
      console.error('Error ending room:', error);
      throw new Error(`Failed to end room: ${error.message}`);
    }
  };
  
  export const getRoomData = async (roomId: string): Promise<RoomData | null> => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (roomSnap.exists()) {
        return roomSnap.data() as RoomData;
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching room data:', error);
      return null;
    }
  };
  
  export const getRoomPlayers = async (roomId: string): Promise<RoomPlayerData[]> => {
    try {
      const playersRef = collection(db, 'rooms', roomId, 'players');
      const playersSnap = await getDocs(playersRef);
      
      return playersSnap.docs.map(doc => doc.data() as RoomPlayerData);
    } catch (error: any) {
      console.error('Error fetching room players:', error);
      return [];
    }
  };
  
  export const getRoomPlayerIds = async (roomId: string): Promise<string[]> => {
    try {
      const roomData = await getRoomData(roomId);
      return roomData?.playerIds || [];
    } catch (error: any) {
      console.error('Error fetching room player IDs:', error);
      return [];
    }
  };
  
  export const isPlayerInRoom = async (
    roomId: string, 
    playerId: string
  ): Promise<boolean> => {
    try {
      const roomData = await getRoomData(roomId);
      return roomData?.playerIds?.includes(playerId) || false;
    } catch (error: any) {
      console.error('Error checking if player is in room:', error);
      return false;
    }
  };
  
  export const kickPlayer = async (
    roomCode: string,
    hostId: string,
    playerIdToKick: string
  ): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    
    try {
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        
        if (!roomSnap.exists()) {
          throw new Error('Room not found');
        }
  
        const roomData = roomSnap.data() as RoomData;
  
        // Verify the requester is the host
        if (roomData.hostId !== hostId) {
          throw new Error('Only the host can kick players');
        }
  
        // Cannot kick the host
        if (playerIdToKick === hostId) {
          throw new Error('Host cannot be kicked');
        }
  
        // Check if player is in the room
        if (!roomData.playerIds || !roomData.playerIds.includes(playerIdToKick)) {
          throw new Error('Player is not in this room');
        }
  
        // Remove player from subcollection
        const playerRef = doc(db, 'rooms', roomCode, 'players', playerIdToKick);
        transaction.delete(playerRef);
        
        // Update room: decrement player count and remove from playerIds array
        transaction.update(roomRef, {
          currentPlayers: increment(-1),
          playerIds: arrayRemove(playerIdToKick)
        });
      });
      
      console.log(`✅ Player ${playerIdToKick} was kicked from room: ${roomCode}`);
    } catch (error: any) {
      console.error('Error kicking player from room:', error);
      throw new Error(`Failed to kick player: ${error.message}`);
    }
  };
  
  export const updateRoomSettings = async (
    roomId: string,
    hostId: string,
    settings: Partial<RoomData['settings']>
  ): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        
        if (!roomSnap.exists()) {
          throw new Error('Room not found');
        }
  
        const roomData = roomSnap.data() as RoomData;
  
        // Verify the requester is the host
        if (roomData.hostId !== hostId) {
          throw new Error('Only the host can update room settings');
        }
  
        // Cannot change settings after game has started
        if (roomData.status !== 'waiting') {
          throw new Error('Cannot change settings after game has started');
        }
  
        const updates: any = {};
        Object.entries(settings).forEach(([key, value]) => {
          updates[`settings.${key}`] = value;
        });
  
        transaction.update(roomRef, updates);
      });
      
      console.log(`✅ Room ${roomId} settings updated`);
    } catch (error: any) {
      console.error('Error updating room settings:', error);
      throw new Error(`Failed to update room settings: ${error.message}`);
    }
  };
  
  export const togglePlayerReady = async (
    roomCode: string,
    playerId: string,
    isReady: boolean
  ): Promise<void> => {
    const playerRef = doc(db, 'rooms', roomCode, 'players', playerId);
    
    try {
      await updateDoc(playerRef, {
        isReady
      });
      
      console.log(`✅ Player ${playerId} ready status: ${isReady}`);
    } catch (error: any) {
      console.error('Error toggling player ready status:', error);
      throw new Error(`Failed to toggle ready status: ${error.message}`);
    }
  };
  
  // ============================================================================
  // GAME COLLECTION HELPERS
  // ============================================================================
  
  export const createGameRecord = async (
    gameData: Omit<GameData, 'gameId' | 'startedAt'>
  ): Promise<string> => {
    try {
      const gamesRef = collection(db, 'games');
      const gameDoc = await addDoc(gamesRef, {
        ...gameData,
        startedAt: serverTimestamp(),
        playerIds: [gameData.playerId], // For security rules
        hostId: gameData.playerId, // For security rules
      });
      
      return gameDoc.id;
    } catch (error: any) {
      console.error('Error creating game record:', error);
      throw new Error(`Failed to create game record: ${error.message}`);
    }
  };
  
  export const updateGameRecord = async (
    gameId: string, 
    updates: Partial<Pick<GameData, 'endedAt' | 'score' | 'accuracy' | 'timeSpent' | 'puzzlesCompleted' | 'isCompleted' | 'rank' | 'answers'>>
  ): Promise<void> => {
    try {
      const gameRef = doc(db, 'games', gameId);
      const updateData: any = { ...updates };
      
      if (updates.isCompleted) {
        updateData.endedAt = serverTimestamp();
      }
      
      await updateDoc(gameRef, updateData);
    } catch (error: any) {
      console.error('Error updating game record:', error);
      throw new Error(`Failed to update game record: ${error.message}`);
    }
  };
  
  export const getPlayerGames = async (
    playerId: string, 
    limitCount: number = 10
  ): Promise<GameData[]> => {
    try {
      const gamesRef = collection(db, 'games');
      const q = query(
        gamesRef,
        where('playerId', '==', playerId),
        orderBy('startedAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        gameId: doc.id, 
        ...doc.data() 
      } as GameData));
    } catch (error: any) {
      console.error('Error fetching player games:', error);
      return [];
    }
  };
  
  export const getRoomGames = async (roomId: string): Promise<GameData[]> => {
    try {
      const gamesRef = collection(db, 'games');
      const q = query(
        gamesRef,
        where('roomId', '==', roomId),
        orderBy('score', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        gameId: doc.id, 
        ...doc.data() 
      } as GameData));
    } catch (error: any) {
      console.error('Error fetching room games:', error);
      return [];
    }
  };
  
  // ============================================================================
  // LEADERBOARD HELPERS
  // ============================================================================
  
  export const getGlobalLeaderboard = async (
    limitCount: number = 50
  ): Promise<PlayerData[]> => {
    try {
      const playersRef = collection(db, 'players');
      const q = query(
        playersRef,
        orderBy('totalScore', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as PlayerData);
    } catch (error: any) {
      console.error('Error fetching global leaderboard:', error);
      return [];
    }
  };
  
  export const getWeeklyLeaderboard = async (
    limitCount: number = 50
  ): Promise<PlayerData[]> => {
    // This would require a separate collection for weekly stats
    // For now, return global leaderboard
    return getGlobalLeaderboard(limitCount);
  };
  
  export const getRoomLeaderboard = async (roomId: string): Promise<RoomPlayerData[]> => {
    try {
      const playersRef = collection(db, 'rooms', roomId, 'players');
      const q = query(
        playersRef,
        orderBy('totalScore', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as RoomPlayerData);
    } catch (error: any) {
      console.error('Error fetching room leaderboard:', error);
      return [];
    }
  };
  
  // ============================================================================
  // ACHIEVEMENT HELPERS
  // ============================================================================
  
  export const checkAndUnlockAchievements = async (
    playerId: string
  ): Promise<string[]> => {
    try {
      const playerData = await getPlayerData(playerId);
      if (!playerData) return [];
  
      const achievementsRef = collection(db, 'achievements');
      const achievementsSnap = await getDocs(achievementsRef);
      
      const unlockedAchievements: string[] = [];
      const batch = writeBatch(db);
      
      for (const achievementDoc of achievementsSnap.docs) {
        const achievement = achievementDoc.data() as AchievementData;
        
        // Skip if already unlocked
        if (playerData.achievements.includes(achievement.id)) continue;
        
        // Check if requirement is met
        const requirement = achievement.requirement;
        let playerValue: number = 0;
        
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
          const playerRef = doc(db, 'players', playerId);
          batch.update(playerRef, {
            achievements: arrayUnion(achievement.id),
            experience: increment(achievement.reward.experience),
          });
          
          unlockedAchievements.push(achievement.name);
        }
      }
      
      if (unlockedAchievements.length > 0) {
        await batch.commit();
      }
      
      return unlockedAchievements;
    } catch (error: any) {
      console.error('Error checking achievements:', error);
      return [];
    }
  };
  
  export const getPlayerAchievements = async (playerId: string): Promise<AchievementData[]> => {
    try {
      const playerData = await getPlayerData(playerId);
      if (!playerData || !playerData.achievements.length) return [];
  
      const achievementsRef = collection(db, 'achievements');
      const achievementsSnap = await getDocs(achievementsRef);
      
      return achievementsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as AchievementData))
        .filter(achievement => playerData.achievements.includes(achievement.id));
    } catch (error: any) {
      console.error('Error fetching player achievements:', error);
      return [];
    }
  };
  
  export const getAllAchievements = async (): Promise<AchievementData[]> => {
    try {
      const achievementsRef = collection(db, 'achievements');
      const achievementsSnap = await getDocs(achievementsRef);
      
      return achievementsSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as AchievementData));
    } catch (error: any) {
      console.error('Error fetching all achievements:', error);
      return [];
    }
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
  
  export const calculateExperience = (
    score: number, 
    timeSpent: number, 
    accuracy: number
  ): number => {
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
  
  export const getActiveRooms = async (limitCount: number = 20): Promise<RoomData[]> => {
    try {
      const roomsRef = collection(db, 'rooms');
      const q = query(
        roomsRef,
        where('status', '==', 'waiting'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as RoomData);
    } catch (error: any) {
      console.error('Error fetching active rooms:', error);
      return [];
    }
  };
  
  export const deleteRoom = async (roomId: string, hostId: string): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        
        if (!roomSnap.exists()) {
          throw new Error('Room not found');
        }
  
        const roomData = roomSnap.data() as RoomData;
  
        // Verify the requester is the host
        if (roomData.hostId !== hostId) {
          throw new Error('Only the host can delete the room');
        }
  
        // Delete all players in subcollection
        const playersRef = collection(db, 'rooms', roomId, 'players');
        const playersSnap = await getDocs(playersRef);
        
        playersSnap.docs.forEach(playerDoc => {
          transaction.delete(playerDoc.ref);
        });
  
        // Delete the room
        transaction.delete(roomRef);
      });
      
      console.log(`✅ Room ${roomId} deleted`);
    } catch (error: any) {
      console.error('Error deleting room:', error);
      throw new Error(`Failed to delete room: ${error.message}`);
    }
  };
  
  // Export all functions
  export default {
    // Player functions
    createOrUpdatePlayer,
    getPlayerData,
    updatePlayerStats,
    updatePlayerPreferences,
    
    // Room functions
    createRoom,
    joinRoom,
    leaveRoom,
    startRoom,
    endRoom,
    getRoomData,
    getRoomPlayers,
    getRoomPlayerIds,
    isPlayerInRoom,
    kickPlayer,
    updateRoomSettings,
    togglePlayerReady,
    getActiveRooms,
    deleteRoom,
    
    // Game functions
    createGameRecord,
    updateGameRecord,
    getPlayerGames,
    getRoomGames,
    
    // Leaderboard functions
    getGlobalLeaderboard,
    getWeeklyLeaderboard,
    getRoomLeaderboard,
    
    // Achievement functions
    checkAndUnlockAchievements,
    getPlayerAchievements,
    getAllAchievements,
    
    // Utility functions
    calculateExperience,
    calculateLevel,
  };
  