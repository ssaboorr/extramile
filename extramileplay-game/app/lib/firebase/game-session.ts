import { 
  createGameRecord, 
  updateGameRecord, 
  updatePlayerStats, 
  checkAndUnlockAchievements,
  calculateExperience,
  calculateLevel,
  PlayerData,
  GameData
} from './collections';
import { User } from 'firebase/auth';

export interface GameSessionData {
  roomId: string;
  gameType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalPuzzles: number;
  timeLimit?: number; // in minutes
}

export interface GameResult {
  score: number;
  accuracy: number; // percentage
  timeSpent: number; // in seconds
  puzzlesCompleted: number;
  answers: Array<{
    puzzleId: string;
    answer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

export class GameSession {
  private gameId: string | null = null;
  private playerId: string;
  private playerName: string;
  private sessionData: GameSessionData;
  private startTime: Date;
  private answers: GameResult['answers'] = [];

  constructor(user: User, sessionData: GameSessionData) {
    this.playerId = user.uid;
    this.playerName = user.displayName || 'Guest Player';
    this.sessionData = sessionData;
    this.startTime = new Date();
  }

  async startGame(): Promise<void> {
    const gameData = {
      roomId: this.sessionData.roomId,
      playerId: this.playerId,
      playerName: this.playerName,
      gameType: this.sessionData.gameType,
      difficulty: this.sessionData.difficulty,
      totalPuzzles: this.sessionData.totalPuzzles,
      score: 0,
      accuracy: 0,
      timeSpent: 0,
      puzzlesCompleted: 0,
      isCompleted: false,
      answers: [],
    };

    this.gameId = await createGameRecord(gameData);
  }

  recordAnswer(puzzleId: string, answer: string, isCorrect: boolean, timeSpent: number): void {
    this.answers.push({
      puzzleId,
      answer,
      isCorrect,
      timeSpent,
    });
  }

  async endGame(): Promise<{
    gameId: string;
    finalScore: number;
    experience: number;
    achievements: string[];
    levelUp: boolean;
    newLevel?: number;
  }> {
    if (!this.gameId) {
      throw new Error('Game not started');
    }

    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000);
    const puzzlesCompleted = this.answers.length;
    const correctAnswers = this.answers.filter(a => a.isCorrect).length;
    const accuracy = puzzlesCompleted > 0 ? (correctAnswers / puzzlesCompleted) * 100 : 0;
    
    // Calculate score based on accuracy, speed, and difficulty
    const score = this.calculateScore(correctAnswers, timeSpent, puzzlesCompleted);
    const experience = calculateExperience(score, timeSpent, accuracy);

    // Update game record
    await updateGameRecord(this.gameId, {
      endedAt: new Date(),
      score,
      accuracy,
      timeSpent,
      puzzlesCompleted,
      isCompleted: true,
      answers: this.answers,
    });

    // Get current player data
    const playerData = await this.getPlayerData();
    if (!playerData) {
      throw new Error('Player data not found');
    }

    // Calculate new stats
    const newTotalGames = playerData.totalGamesPlayed + 1;
    const newTotalScore = playerData.totalScore + score;
    const newBestScore = Math.max(playerData.bestScore, score);
    const newTotalPlayTime = playerData.totalPlayTime + Math.floor(timeSpent / 60);
    const newExperience = playerData.experience + experience;
    const newLevel = calculateLevel(newExperience);
    const levelUp = newLevel > playerData.level;

    // Determine if this was a win (you can customize this logic)
    const isWin = accuracy >= 80; // Consider it a win if accuracy is 80% or higher
    const newGamesWon = isWin ? playerData.gamesWon + 1 : playerData.gamesWon;
    const newCurrentStreak = isWin ? playerData.currentStreak + 1 : 0;
    const newBestStreak = Math.max(playerData.bestStreak, newCurrentStreak);

    // Update player stats
    await updatePlayerStats(this.playerId, {
      totalGamesPlayed: newTotalGames,
      totalScore: newTotalScore,
      bestScore: newBestScore,
      gamesWon: newGamesWon,
      totalPlayTime: newTotalPlayTime,
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak,
      experience: newExperience,
      level: newLevel,
    });

    // Check for new achievements
    const achievements = await checkAndUnlockAchievements(this.playerId);

    return {
      gameId: this.gameId,
      finalScore: score,
      experience,
      achievements,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
    };
  }

  private calculateScore(correctAnswers: number, timeSpent: number, totalPuzzles: number): number {
    // Base score from correct answers
    let score = correctAnswers * 10;
    
    // Bonus for completing all puzzles
    if (correctAnswers === totalPuzzles) {
      score += 50;
    }
    
    // Speed bonus (faster completion = higher score)
    const averageTimePerPuzzle = timeSpent / totalPuzzles;
    if (averageTimePerPuzzle < 30) { // Less than 30 seconds per puzzle
      score += 25;
    } else if (averageTimePerPuzzle < 60) { // Less than 1 minute per puzzle
      score += 15;
    }
    
    // Difficulty multiplier
    switch (this.sessionData.difficulty) {
      case 'easy':
        score = Math.floor(score * 1.0);
        break;
      case 'medium':
        score = Math.floor(score * 1.2);
        break;
      case 'hard':
        score = Math.floor(score * 1.5);
        break;
    }
    
    return Math.max(score, 0);
  }

  private async getPlayerData(): Promise<PlayerData | null> {
    // This would typically come from your player collection
    // For now, we'll import the function
    const { getPlayerData } = await import('./collections');
    return getPlayerData(this.playerId);
  }
}

// Helper function to create a new game session
export const createGameSession = (user: User, sessionData: GameSessionData): GameSession => {
  return new GameSession(user, sessionData);
};

// Helper function to simulate a complete game (for testing)
export const simulateGame = async (
  user: User, 
  sessionData: GameSessionData,
  answers: Array<{ puzzleId: string; answer: string; isCorrect: boolean; timeSpent: number }>
): Promise<{
  gameId: string;
  finalScore: number;
  experience: number;
  achievements: string[];
  levelUp: boolean;
  newLevel?: number;
}> => {
  const session = createGameSession(user, sessionData);
  
  await session.startGame();
  
  // Record all answers
  answers.forEach(answer => {
    session.recordAnswer(answer.puzzleId, answer.answer, answer.isCorrect, answer.timeSpent);
  });
  
  // End the game
  return await session.endGame();
};
