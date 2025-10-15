'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Slide,
  useTheme,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import { joinRoom } from '@/lib/firebase/firestore';
import React from 'react';
import GlassButton from '@/components/shared/GlassButton';

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
  const theme = useTheme();
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
      router.push(`/game/${roomCode.toUpperCase()}`);
      onClose();
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
          // borderRadius: Number(theme.shape.borderRadius) * 2,
          m: 2,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
          color: 'white',
          position: 'relative',
          // borderRadius: `${Number(theme.shape.borderRadius) * 2}px ${Number(theme.shape.borderRadius) * 2}px 0 0`,
        }}
      >
        <Typography component="span" variant="h6" sx={{ fontWeight: 700, pr: 8 }}>
          🚀 Join Game Room
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 4, px: { xs: 3, sm: 4 } }}>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            mb: 3,
            lineHeight: 1.6,
          }}
        >
          Enter the 6-character room code shared by the host to join the game and compete
          with other players.
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backdropFilter: 'blur(10px)',
              '& .MuiAlert-icon': { color: 'white' },
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
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
                // borderRadius: theme.shape.borderRadius,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.light,
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: theme.palette.primary.light,
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              mt: 1,
              display: 'block',
              textAlign: 'center',
            }}
          >
            {roomCode.length}/6 characters
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            // borderRadius: Number(theme.shape.borderRadius) * 1.5,
            p: 3,
            border: '1px solid rgba(236, 72, 153, 0.2)',
          }}
        >
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.secondary.light,
              mb: 2,
            }}
          >
            What to expect:
          </Typography>
          <Box component="ul" sx={{ color: 'rgba(255, 255, 255, 0.8)', pl: 3, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>4 exciting puzzles to solve</Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Compete against other players</Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Live leaderboard updates</Typography>
            <Typography component="li" variant="body2">Timed challenges with scoring</Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 3, sm: 4 }, pb: 3, gap: 2 }}>
        <GlassButton
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </GlassButton>
        <GlassButton
          variant="contained"
          onClick={handleJoinRoom}
          disabled={loading || roomCode.length !== 6}
          loading={loading}
        >
          Join Room
        </GlassButton>
      </DialogActions>
    </Dialog>
  );
}
