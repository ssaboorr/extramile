import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInAnonymously,
    User 
  } from 'firebase/auth';
  import { auth } from '../config';
  
  const googleProvider = new GoogleAuthProvider();
  
  export const signInWithGoogle = async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };
  
  export const signInAsGuest = async (): Promise<User> => {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
      throw error;
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
  