# Firestore Collections & Helper Functions

This document outlines the comprehensive Firestore database structure and helper functions for the game application.

## 📊 Collections Overview

### 1. **Players Collection** (`/players/{uid}`)
Stores comprehensive player data and statistics.

#### Fields:
```typescript
interface PlayerData {
  // Basic Info
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAnonymous: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  loginCount: number;
  
  // Game Statistics
  totalGamesPlayed: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
  gamesWon: number;
  winRate: number;
  totalPlayTime: number; // in minutes
  
  // Streaks & Progression
  currentStreak: number;
  bestStreak: number;
  level: number;
  experience: number;
  achievements: string[];
  
  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    language: string;
  };
  
  // Advanced Stats
  stats: {
    fastestCompletion: number; // in seconds
    mostAccurateGame: number; // percentage
    favoriteGameType: string;
    lastPlayedAt?: Timestamp;
  };
}
```

### 2. **Rooms Collection** (`/rooms/{roomId}`)
Manages game rooms and multiplayer sessions.

#### Fields:
```typescript
interface RoomData {
  roomId: string;
  hostId: string;
  hostName: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  gameType: string;
  maxPlayers: number;
  currentPlayers: number;
  
  // Timestamps
  createdAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  
  // Room Settings
  settings: {
    timeLimit: number; // in minutes
    difficulty: 'easy' | 'medium' | 'hard';
    allowSpectators: boolean;
    isPrivate: boolean;
  };
  
  // Results
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
```

#### Subcollection: Players (`/rooms/{roomId}/players/{playerId}`)
```typescript
interface RoomPlayer {
  playerId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  joinedAt: Timestamp;
  totalScore: number;
  isHost: boolean;
}
```

### 3. **Games Collection** (`/games/{gameId}`)
Tracks individual game sessions and results.

#### Fields:
```typescript
interface GameData {
  gameId: string;
  roomId: string;
  playerId: string;
  playerName: string;
  gameType: string;
  
  // Timestamps
  startedAt: Timestamp;
  endedAt?: Timestamp;
  
  // Game Results
  score: number;
  accuracy: number;
  timeSpent: number; // in seconds
  puzzlesCompleted: number;
  totalPuzzles: number;
  difficulty: string;
  rank?: number;
  isCompleted: boolean;
  
  // Detailed Answers
  answers: Array<{
    puzzleId: string;
    answer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}
```

### 4. **Achievements Collection** (`/achievements/{achievementId}`)
Defines available achievements and their requirements.

#### Fields:
```typescript
interface AchievementData {
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
```

## 🔧 Helper Functions

### Player Management

#### `createOrUpdatePlayer(user: User): Promise<void>`
- Creates new player record or updates existing one
- Automatically called on login
- Updates login count and last login time

#### `getPlayerData(uid: string): Promise<PlayerData | null>`
- Retrieves complete player data
- Returns null if player doesn't exist

#### `updatePlayerStats(uid: string, stats: Partial<PlayerData>): Promise<void>`
- Updates player statistics
- Automatically calculates derived stats (average score, win rate)

#### `updatePlayerPreferences(uid: string, preferences: Partial<PlayerData['preferences']>): Promise<void>`
- Updates player preferences
- Supports theme, sound, notifications, language settings

### Room Management

#### `createRoom(hostId: string, gameType?: string): Promise<string>`
- Creates a new game room
- Returns 6-character room code
- Sets up room settings and metadata

#### `joinRoom(roomId: string, playerId: string): Promise<void>`
- Adds player to existing room
- Validates room capacity and status
- Updates player count

#### `startRoom(roomId: string): Promise<void>`
- Changes room status from 'waiting' to 'active'
- Records start time

#### `endRoom(roomId: string, results: RoomData['results']): Promise<void>`
- Marks room as completed
- Records final results and rankings

### Game Session Management

#### `GameSession` Class
```typescript
const session = new GameSession(user, sessionData);
await session.startGame();
session.recordAnswer(puzzleId, answer, isCorrect, timeSpent);
const result = await session.endGame();
```

#### `createGameRecord(gameData: Omit<GameData, 'gameId' | 'startedAt'>): Promise<string>`
- Creates new game record
- Returns game ID

#### `updateGameRecord(gameId: string, updates: Partial<GameData>): Promise<void>`
- Updates game progress and results

### Leaderboards & Analytics

#### `getGlobalLeaderboard(limitCount?: number): Promise<PlayerData[]>`
- Returns top players by total score
- Default limit: 50 players

#### `getWeeklyLeaderboard(limitCount?: number): Promise<PlayerData[]>`
- Returns weekly top performers
- Can be extended with time-based filtering

#### `getPlayerGames(playerId: string, limitCount?: number): Promise<GameData[]>`
- Returns player's recent games
- Sorted by start time (newest first)

### Achievement System

#### `checkAndUnlockAchievements(playerId: string): Promise<string[]>`
- Checks player stats against achievement requirements
- Unlocks new achievements
- Returns list of newly unlocked achievement names

#### `initializeAchievements(): Promise<void>`
- Sets up predefined achievements in Firestore
- Call once during app initialization

## 🎮 Game Session Example

```typescript
import { createGameSession } from '@/lib/firebase/game-session';

// Create a new game session
const session = createGameSession(user, {
  roomId: 'ABC123',
  gameType: 'mixed',
  difficulty: 'medium',
  totalPuzzles: 4,
  timeLimit: 30
});

// Start the game
await session.startGame();

// Record player answers during gameplay
session.recordAnswer('puzzle1', 'answer1', true, 25);
session.recordAnswer('puzzle2', 'answer2', false, 45);
session.recordAnswer('puzzle3', 'answer3', true, 30);
session.recordAnswer('puzzle4', 'answer4', true, 20);

// End the game and get results
const result = await session.endGame();
console.log('Final Score:', result.finalScore);
console.log('Experience Gained:', result.experience);
console.log('New Achievements:', result.achievements);
console.log('Level Up:', result.levelUp);
```

## 🔄 React Hook Usage

```typescript
import { usePlayer } from '@/lib/hooks/usePlayer';

function UserProfile({ user }) {
  const { 
    playerData, 
    loading, 
    error, 
    updateStats, 
    updatePreferences 
  } = usePlayer(user);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h2>{playerData?.displayName}</h2>
      <p>Level: {playerData?.level}</p>
      <p>Games Played: {playerData?.totalGamesPlayed}</p>
      <p>Best Score: {playerData?.bestScore}</p>
      <p>Win Rate: {playerData?.winRate.toFixed(1)}%</p>
    </div>
  );
}
```

## 📈 Experience & Level System

### Experience Calculation
- Base: Score ÷ 10
- Speed Bonus: +20% for completion < 5 minutes
- Accuracy Bonus: +30% for accuracy > 90%
- Minimum: 1 experience point per game

### Level Progression
- Formula: `100 * level^1.5` experience points per level
- Level 1: 0-141 XP
- Level 2: 142-382 XP
- Level 3: 383-702 XP
- And so on...

## 🏆 Achievement Categories

1. **Score Achievements**: Based on total score milestones
2. **Game Count**: Based on number of games played
3. **Streak Achievements**: Based on consecutive wins
4. **Win Rate**: Based on overall performance percentage
5. **Special**: Unique accomplishments and first-time events

## 🔐 Security Rules

Make sure to set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Players can read/write their own data
    match /players/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Rooms are readable by authenticated users
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      
      // Room players subcollection
      match /players/{playerId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == playerId;
      }
    }
    
    // Games are readable by authenticated users
    match /games/{gameId} {
      allow read, write: if request.auth != null;
    }
    
    // Achievements are readable by all authenticated users
    match /achievements/{achievementId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can write achievements
    }
  }
}
```

## 🚀 Getting Started

1. **Initialize Achievements** (run once):
```typescript
import { setupFirestore } from '@/lib/firebase/init-achievements';
await setupFirestore();
```

2. **User Authentication** automatically creates/updates player data

3. **Use the React Hook** in components to access player data

4. **Track Game Sessions** using the GameSession class

This comprehensive system provides everything needed for a full-featured multiplayer game with user progression, achievements, and detailed analytics!
