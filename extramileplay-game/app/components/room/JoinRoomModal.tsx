'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import { joinRoom } from '@/lib/firebase/firestore';
import React from 'react';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export default function JoinRoomModal({ open, onClose }: JoinRoomModalProps) {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinRoom = async () => {
    if (!roomCode || roomCode.length !== 6) {
      setError('Please enter a valid 6-character room code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await joinRoom(roomCode.toUpperCase());
      router.push(`/room/${roomCode.toUpperCase()}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRoomCode('');
    setError(null);
    onClose();
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setRoomCode(value);
      setError(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          m: 2,
        },
      }}
    >
      <DialogTitle className="bg-gradient-to-r from-pink-500 to-rose-600 text-white relative">
        <Typography variant="h6" className="font-bold pr-8">
          🚀 Join Game Room
        </Typography>
        <IconButton
          onClick={handleClose}
          className="absolute top-2 right-2 text-white hover:bg-white/20"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 4, px: { xs: 3, sm: 4 } }}>
        <Typography variant="body1" className="text-gray-600 mb-4">
          Enter the 6-character room code shared by the host to join the game and compete
          with other players.
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box className="mb-4">
          <TextField
            fullWidth
            label="Room Code"
            placeholder="ABC123"
            value={roomCode}
            onChange={handleCodeChange}
            disabled={loading}
            autoFocus
            inputProps={{
              maxLength: 6,
              style: {
                textTransform: 'uppercase',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                letterSpacing: '0.5rem',
                textAlign: 'center',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Typography variant="caption" className="text-gray-500 mt-1 block text-center">
            {roomCode.length}/6 characters
          </Typography>
        </Box>

        <Box className="bg-pink-50 rounded-2xl p-4">
          <Typography variant="subtitle2" className="font-semibold text-pink-900 mb-2">
            What to expect:
          </Typography>
          <ul className="text-sm text-pink-700 space-y-1 ml-4">
            <li>4 exciting puzzles to solve</li>
            <li>Compete against other players</li>
            <li>Live leaderboard updates</li>
            <li>Timed challenges with scoring</li>
          </ul>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 3, sm: 4 }, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleJoinRoom}
          disabled={loading || roomCode.length !== 6}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
          className="bg-gradient-to-r from-pink-500 to-rose-600"
        >
          {loading ? 'Joining...' : 'Join Room'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
