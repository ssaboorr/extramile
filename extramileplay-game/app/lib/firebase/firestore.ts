import { collection, addDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './config';

// Generate random 6-character room code
const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createRoom = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const roomCode = generateRoomCode();
  const roomRef = doc(db, 'rooms', roomCode);

  await setDoc(roomRef, {
    roomId: roomCode,
    hostId: user.uid,
    status: 'waiting',
    createdAt: serverTimestamp(),
    startedAt: null,
    participantCount: 1,
  });

  // Add host as first player
  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
  await setDoc(playerRef, {
    playerId: user.uid,
    displayName: user.displayName || 'Guest',
    email: user.email,
    joinedAt: serverTimestamp(),
    totalScore: 0,
    isHost: true,
  });

  return roomCode;
};

export const joinRoom = async (roomCode: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }

  const roomData = roomSnap.data();
  if (roomData.status !== 'waiting') {
    throw new Error('Room is not accepting new players');
  }

  // Add player to room
  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
  await setDoc(playerRef, {
    playerId: user.uid,
    displayName: user.displayName || 'Guest',
    email: user.email,
    joinedAt: serverTimestamp(),
    totalScore: 0,
    isHost: false,
  });
};
