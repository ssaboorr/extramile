import { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Avatar, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { onSnapshot, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface LeaderRow {
  playerId: string;
  displayName: string;
  photoURL?: string;
  points: number;
  lastSubmission?: any;
}

export default function RoomLeaderboard({ roomId }: { roomId: string }) {
  const [rows, setRows] = useState<LeaderRow[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const lbRef = collection(db, 'rooms', roomId, 'leaderboard');
    const unsubLB = onSnapshot(lbRef, async (snap) => {
      const entries: LeaderRow[] = [];
      const fetches: Promise<void>[] = [];

      snap.forEach((docSnap) => {
        const d = docSnap.data() as any;
        const playerId = docSnap.id;
        const p: LeaderRow = {
          playerId,
          displayName: d.displayName || 'Player',
          photoURL: d.photoURL,
          points: d.points || 0,
          lastSubmission: undefined,
        };
        entries.push(p);
      });

      // Fetch player docs for displayName and lastSubmission if not present
      for (const e of entries) {
        fetches.push((async () => {
          try {
            const pRef = doc(db, 'rooms', roomId, 'players', e.playerId);
            const pSnap = await getDoc(pRef);
            if (pSnap.exists()) {
              const pd = pSnap.data() as any;
              e.displayName = pd.displayName || e.displayName;
              e.photoURL = pd.photoURL || e.photoURL;
              e.lastSubmission = pd.lastSubmission || undefined;
            }
          } catch (err) {
            // ignore
          }
        })());
      }

      await Promise.all(fetches);
      // sort by points desc
      entries.sort((a, b) => (b.points || 0) - (a.points || 0));
      setRows(entries);
    });

    return () => unsubLB();
  }, [roomId]);

  return (
    <Box>
      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Live Leaderboard</Typography>
      <Table sx={{ color: 'white' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: 'white' }}>Player</TableCell>
            <TableCell sx={{ color: 'white' }}>Last Answer</TableCell>
            <TableCell sx={{ color: 'white' }}>Correct Answer</TableCell>
            <TableCell sx={{ color: 'white' }}>Last Points</TableCell>
            <TableCell sx={{ color: 'white' }}>Total Points</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => {
            const last = r.lastSubmission;
            const wasCorrect = last?.isCorrect ?? null;
            const answerDisplay = last ? (last.answer || '—') : '—';
            const correctDisplay = last ? (last.correctAnswer || '—') : '—';
            let lastPoints: number | string = '—';
            if (typeof last?.pointsEarned === 'number') {
              lastPoints = last.pointsEarned;
            } else if (wasCorrect === false) {
              lastPoints = 0;
            }

            return (
              <TableRow key={r.playerId}>
                <TableCell sx={{ color: 'white' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={r.photoURL} sx={{ width: 32, height: 32 }} />
                    <span>{r.displayName}</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {wasCorrect === null ? null : wasCorrect ? (
                    <CheckCircleIcon fontSize="small" sx={{ color: '#34d399' }} />
                  ) : (
                    <CancelIcon fontSize="small" sx={{ color: '#f87171' }} />
                  )}
                  <span>{answerDisplay}</span>
                </TableCell>
                <TableCell sx={{ color: 'white' }}>{correctDisplay}</TableCell>
                <TableCell sx={{ color: 'white' }}>{typeof lastPoints === 'number' ? lastPoints : lastPoints || '—'}</TableCell>
                <TableCell sx={{ color: 'white' }}>{r.points ?? 0}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
