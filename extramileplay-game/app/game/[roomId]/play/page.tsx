'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GameSession from '@/components/game/GameSession';
import RoomLeaderboard from '@/components/game/RoomLeaderboard';
import { doc, onSnapshot, collection, addDoc, setDoc, serverTimestamp, updateDoc, getDoc, arrayRemove } from 'firebase/firestore';
import { Box } from '@mui/material';
import { db } from '@/lib/firebase/config';
import { gameQuestions } from '@/lib/firebase/gameQuestions';
import AppBackground from '@/components/shared/AppBackground';
import AppHeader from '@/components/shared/AppHeader';
import { auth } from '@/lib/firebase/config';
import { signOut } from '@/lib/firebase/auth/auth';

interface RecordedSubmission {
  puzzleId: string;
  answer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number;
}

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [user, setUser] = useState<any>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [puzzles, setPuzzles] = useState<any[] | null>(null);
  const [sessionIndex, setSessionIndex] = useState<number>(0);
  const [sessionDifficulty, setSessionDifficulty] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => {
      if (!u) router.push('/login');
      setUser(u);
    });
    return unsubAuth;
  }, [router]);

  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, 'rooms', roomId);
    const unsub = onSnapshot(roomRef, (snap) => {
      if (!snap.exists()) {
        router.push('/');
        return;
      }
      const data = snap.data();
      setRoomData(data);
      const sessionFromRoom = typeof data.currentSessionIndex === 'number' ? data.currentSessionIndex : 0;
      setSessionIndex((prev) => (prev === sessionFromRoom ? prev : sessionFromRoom));
      if (Array.isArray(data.sessions) && data.sessions[sessionFromRoom]?.difficulty) {
        setSessionDifficulty(data.sessions[sessionFromRoom].difficulty);
      }
      // If room is not active redirect back
      if (data.status !== 'active') {
        router.push(`/game/${roomId}`);
      }
    });

    return unsub;
  }, [roomId, router]);

  // Load puzzles for the room: try room.challengeIds -> fetch each from 'challenges' collection
  useEffect(() => {
    if (!roomData) return;

    const load = async () => {
      try {
        // If room defines sessions, use current session's challenge IDs
        const sessions = roomData.sessions || [];
        const currentSessionIndex = roomData.currentSessionIndex || 0;

        let ids: string[] = [];
        // Use local sessionIndex state if available; else use room's currentSessionIndex
        const effectiveSessionIndex = typeof sessionIndex === 'number' ? sessionIndex : currentSessionIndex;

        if (sessions && sessions.length > 0 && sessions[effectiveSessionIndex]) {
          ids = sessions[effectiveSessionIndex].challenges || [];
          setSessionDifficulty(sessions[effectiveSessionIndex].difficulty || null);
        } else {
          ids = roomData.challengeIds || [];
        }

        if (ids.length > 0) {
          const fetched: any[] = [];
          for (const id of ids) {
            const qRef = doc(db, 'challenges', id);
            const snap = await getDoc(qRef);
            if (snap.exists()) fetched.push({ challengeId: snap.id, ...(snap.data() as any) });
          }
          if (fetched.length > 0) {
            // normalize to Puzzle shape
            setPuzzles(fetched.map((c: any) => ({
              id: c.challengeId || c.id,
              type: c.type === 'mcq' ? 'mcq' : (c.type === 'typing' ? 'text' : 'text'),
              question: c.question || c.emojis || c.targetText || '',
              options: c.options || undefined,
              correctAnswer: c.correctAnswer || '',
              explanation: c.explanation || '',
              points: c.maxScore || 0,
              timeLimit: c.timeLimit || 60,
            })));
            return;
          }
        }

        // Fallback: use local gameSession sample (imported) and normalize
        setPuzzles(gameQuestions.slice(0, 4).map((c) => ({
          id: c.challengeId,
          type: c.type === 'mcq' ? 'mcq' : (c.type === 'typing' ? 'text' : 'text'),
          question: c.question || c.emojis || c.targetText || '',
          options: c.options || undefined,
          correctAnswer: c.correctAnswer || '',
          explanation: (c as any).explanation || '',
          points: c.maxScore || 0,
          timeLimit: c.timeLimit || 60,
        })));
      } catch (err) {
        console.error('Error loading puzzles:', err);
        setPuzzles(gameQuestions.slice(0, 4).map((c) => ({
          id: c.challengeId,
          type: c.type === 'mcq' ? 'mcq' : (c.type === 'typing' ? 'text' : 'text'),
          question: c.question || c.emojis || c.targetText || '',
          options: c.options || undefined,
          correctAnswer: c.correctAnswer || '',
          explanation: (c as any).explanation || '',
          points: c.maxScore || 0,
          timeLimit: c.timeLimit || 60,
        })));
      }
    };

    load();
  }, [roomData, sessionIndex]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Persist individual answer submissions to Firestore
  const persistAnswer = async ({
    puzzleId,
    answer,
    correctAnswer,
    isCorrect,
    pointsEarned,
    timeSpent,
  }: RecordedSubmission) => {
    if (!roomId || !user) return;

    const playerRef = doc(db, 'rooms', roomId, 'players', user.uid);
    try {
      console.log('[persistAnswer] called', { roomId, playerId: user.uid, puzzleId, answer, isCorrect, timeSpent, pointsEarned });
      const safePuzzleId = puzzleId || 'unknown';
      if (!puzzleId) console.warn('persistAnswer called with undefined puzzleId, using "unknown"');
      // Update player's latest submission and append to submissions subcollection
      await setDoc(playerRef, {
        lastSubmission: {
          puzzleId: safePuzzleId,
          answer,
          correctAnswer,
          isCorrect,
          pointsEarned,
          timeSpent,
          submittedAt: serverTimestamp(),
          sessionIndex: sessionIndex,
          sessionDifficulty: sessionDifficulty || null,
        }
      }, { merge: true });
      console.log('[persistAnswer] updated player lastSubmission', { playerRef: playerRef.path });

      // Score computation and authoritative updates are done server-side by
      // the Cloud Function (validateSubmission). Do not update scores here to
      // avoid double-counting.

      // Also add to submissions list for history
      const submissionsRef = collection(db, 'rooms', roomId, 'players', user.uid, 'submissions');
      await addDoc(submissionsRef, {
        playerId: user.uid,
        roomId,
        puzzleId: safePuzzleId,
        answer,
        correctAnswer,
        isCorrect,
        pointsEarned,
        timeSpent,
        sessionIndex: sessionIndex,
        sessionDifficulty: sessionDifficulty || null,
        submittedAt: serverTimestamp(),
      });
      console.log('[persistAnswer] added room submission doc', { submissionsRef: submissionsRef.path });

      // Also persist to global player submissions for leaderboard/history
      try {
        const globalSubRef = collection(db, 'players', user.uid, 'submissions');
        // compute score from challenge if available
        const q = gameQuestions.find(x => x.challengeId === safePuzzleId);
        const fallbackPoints = isCorrect ? (q ? q.maxScore || 0 : 0) : 0;

        await addDoc(globalSubRef, {
          playerId: user.uid,
          roomId,
          puzzleId: safePuzzleId,
          answer,
          correctAnswer,
          isCorrect,
          points: pointsEarned ?? fallbackPoints,
          timeSpent,
          sessionIndex: sessionIndex,
          sessionDifficulty: sessionDifficulty || null,
          submittedAt: serverTimestamp(),
        });
        console.log('[persistAnswer] added global submission doc', { globalSubRef: globalSubRef.path });
      } catch (err) {
        console.error('Error adding global submission:', err);
      }

      // NOTE: completedChallenges and totalScore are authoritative and
      // updated server-side by the Cloud Function (validateSubmission).
      // Do not update them from the client to avoid permission errors.
    } catch (err) {
      console.error('Error persisting answer:', err);
    }
  };

  if (!roomData) return null;

  return (
    <AppBackground>
      <AppHeader user={user} onLogout={handleLogout} title={`Playing - Room ${roomId}`} />
      <div style={{ maxWidth: 900, margin: '24px auto' }}>
        <Box sx={{ mb: 4 }}>
          <RoomLeaderboard roomId={roomId} />
        </Box>

        <GameSession
          roomId={roomId}
          playerId={user?.uid || ''}
          onGameComplete={async (results) => {
            console.log('Game complete (onGameComplete):', results);
            // persist final results to player's games subcollection
            try {
              console.log('[onGameComplete] saving final game results to players/%s/games', user.uid);
              const gamesRef = collection(db, 'players', user.uid, 'games');
              const docRef = await addDoc(gamesRef, {
                roomId,
                ...results,
                completedAt: serverTimestamp(),
              });
              console.log('[onGameComplete] saved game doc:', docRef.id);
            } catch (err) {
              console.error('Error saving final game results:', (err as any)?.code || err, err);
            }

            // Remove room from player's activeRooms
            try {
              console.log('[onGameComplete] removing activeRoom for player', user.uid, roomId);
              const playerRef = doc(db, 'players', user.uid);
              await updateDoc(playerRef, {
                activeRooms: arrayRemove(roomId)
              });
              console.log('[onGameComplete] removed activeRoom for player', user.uid);
            } catch (err) {
              console.error('Error removing active room from player:', (err as any)?.code || err, err);
            }

            router.push(`/game/${roomId}`);
          }}
          onRecordAnswer={persistAnswer}
          // Give each challenge a 5 minute timer for players
          // (GamePuzzle will render the countdown)
          // Note: GameSession currently forwards this to GamePuzzle
          // via a prop named countdownOverrideSeconds (handled in GameSession).
          // Provide 5 minutes (300 seconds)
          // @ts-ignore: dynamic prop forwarded
          countdownOverrideSeconds={300}
          puzzles={puzzles ?? undefined}
        />
        <Box sx={{ mt: 4 }}>
          <RoomLeaderboard roomId={roomId} />
        </Box>
      </div>
    </AppBackground>
  );
}
