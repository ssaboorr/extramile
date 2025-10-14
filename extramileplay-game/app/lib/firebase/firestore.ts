import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './config';
import { createRoom as createRoomHelper, joinRoom as joinRoomHelper } from './collections';

// Re-export the new room functions
export const createRoom = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const roomCode = await createRoomHelper(user.uid);
  
  // Add host as first player in room's player subcollection
  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
  await setDoc(playerRef, {
    playerId: user.uid,
    displayName: user.displayName || 'Guest',
    email: user.email,
    photoURL: user.photoURL,
    joinedAt: serverTimestamp(),
    totalScore: 0,
    isHost: true,
  });

  return roomCode;
};

export const joinRoom = async (roomCode: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  await joinRoomHelper(roomCode, user.uid);
};
