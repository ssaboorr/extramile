import { db } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Test function to verify Firestore connection and permissions
export const testFirestoreConnection = async (): Promise<void> => {
  try {
    console.log('Testing Firestore connection...');
    
    // Test write permission
    const testDocRef = doc(db, 'test', 'connection-test');
    await setDoc(testDocRef, {
      message: 'Connection test',
      timestamp: new Date(),
    });
    console.log('✅ Write permission: OK');
    
    // Test read permission
    const docSnap = await getDoc(testDocRef);
    if (docSnap.exists()) {
      console.log('✅ Read permission: OK');
      console.log('📄 Document data:', docSnap.data());
    } else {
      console.log('❌ Read permission: FAILED');
    }
    
  } catch (error: any) {
    console.error('❌ Firestore connection test failed:', error);
    
    if (error.code === 'permission-denied') {
      console.error('🔒 Permission denied. Check your Firestore security rules.');
    } else if (error.code === 'unavailable') {
      console.error('🌐 Firestore is unavailable. Check your internet connection and Firebase project configuration.');
    } else if (error.code === 'unauthenticated') {
      console.error('🔑 User not authenticated. Make sure the user is signed in.');
    } else {
      console.error('❓ Unknown error:', error.message);
    }
    
    throw error;
  }
};

// Test function to verify player data creation
export const testPlayerCreation = async (uid: string): Promise<void> => {
  try {
    console.log('Testing player creation...');
    
    const playerRef = doc(db, 'players', uid);
    await setDoc(playerRef, {
      uid,
      displayName: 'Test Player',
      email: 'test@example.com',
      isAnonymous: false,
      createdAt: new Date(),
      lastLoginAt: new Date(),
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
    });
    
    console.log('✅ Player creation: OK');
    
  } catch (error: any) {
    console.error('❌ Player creation failed:', error);
    throw error;
  }
};
