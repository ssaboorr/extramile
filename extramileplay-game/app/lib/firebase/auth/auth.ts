import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInAnonymously,
    User 
  } from 'firebase/auth';
  import { auth } from '../config';
  import { createOrUpdatePlayer } from '../collections';
  
  const googleProvider = new GoogleAuthProvider();
  
  export const signInWithGoogle = async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store/update player data in Firestore
      try {
        await createOrUpdatePlayer(user);
      } catch (firestoreError) {
        console.error('Error creating/updating player data:', firestoreError);
        // Don't throw here - authentication was successful
        // The user can still use the app, but their data won't be saved
      }
      
      return user;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error('Sign-in failed. Please try again.');
      }
    }
  };
  
  export const signInAsGuest = async (): Promise<User> => {
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;
      
      // Store/update player data in Firestore
      try {
        await createOrUpdatePlayer(user);
      } catch (firestoreError) {
        console.error('Error creating/updating player data:', firestoreError);
        // Don't throw here - authentication was successful
      }
      
      return user;
    } catch (error: any) {
      console.error('Anonymous sign-in error:', error);
      
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error('Guest sign-in failed. Please try again.');
      }
    }
  };
  
  export const signOut = async (): Promise<void> => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  };
  