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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import React from 'react';
import { createRoom } from '@/lib/firebase/firestore';
import GlassButton from '@/components/shared/GlassButton';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ open, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateRoom = async () => {
    setLoading(true);
    setError(null);

    try {
      const code = await createRoom();
      setRoomCode(code);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnterRoom = () => {
    if (roomCode) {
      router.push(`/game/${roomCode}`);
      onClose();
    }
  };

  const handleClose = () => {
    setRoomCode(null);
    setError(null);
    onClose();
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
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          position: 'relative',
          // borderRadius: `${Number(theme.shape.borderRadius) * 2}px ${Number(theme.shape.borderRadius) * 2}px 0 0`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, pr: 8 }}>
          🎯 Create New Game Room
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
        {!roomCode ? (
          <Box>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 3,
                lineHeight: 1.6,
              }}
            >
              Create a new game room and become the host. You'll receive a unique 6-character
              room code that others can use to join your game.
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

            <Box
              sx={{
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                // borderRadius: Number(theme.shape.borderRadius) * 1.5,
                p: 3,
                mb: 3,
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.primary.light,
                  mb: 2,
                }}
              >
                As Host, you can:
              </Typography>
              <Box component="ul" sx={{ color: 'rgba(255, 255, 255, 0.8)', pl: 3, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Start and stop the game</Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>View all participants</Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Monitor live leaderboard</Typography>
                <Typography component="li" variant="body2">Export results as CSV</Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  borderRadius: '50%',
                  mb: 3,
                  animation: 'bounce 1s infinite',
                }}
              >
                <Typography variant="h4">🎉</Typography>
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  mb: 1,
                }}
              >
                Room Created Successfully!
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Share this code with players
              </Typography>
            </Box>

            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: Number(theme.shape.borderRadius) * 1.5,
                p: 4,
                mb: 3,
                border: '2px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'block',
                  mb: 2,
                }}
              >
                Room Code
              </Typography>
              <Typography
                variant="h3"
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.primary.light,
                  letterSpacing: '0.5em',
                  mb: 3,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                }}
              >
                {roomCode}
              </Typography>
              <GlassButton
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyCode}
                sx={{
                  border: copied ? '2px solid rgba(34, 197, 94, 0.5)' : undefined,
                  color: copied ? theme.palette.success.light : undefined,
                }}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </GlassButton>
            </Box>

            <Alert 
              severity="info" 
              icon={false}
              sx={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              Players can join using this code from the "Join Room" page
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 3, sm: 4 }, pb: 3, gap: 2 }}>
        {!roomCode ? (
          <>
            <GlassButton
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="contained"
              onClick={handleCreateRoom}
              disabled={loading}
              loading={loading}
            >
              Create Room
            </GlassButton>
          </>
        ) : (
          <>
            <GlassButton
              variant="outlined"
              onClick={handleClose}
            >
              Close
            </GlassButton>
            <GlassButton
              variant="contained"
              onClick={handleEnterRoom}
            >
              Enter Room
            </GlassButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
