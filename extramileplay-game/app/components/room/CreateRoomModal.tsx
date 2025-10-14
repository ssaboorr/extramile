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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import React from 'react';
import { createRoom } from '@/lib/firebase/firestore';

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
      router.push(`/admin/${roomCode}`);
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
          borderRadius: 3,
          m: 2,
        },
      }}
    >
      <DialogTitle className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white relative">
        <Typography variant="h6" className="font-bold pr-8">
          🎯 Create New Game Room
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
        {!roomCode ? (
          <Box>
            <Typography variant="body1" className="text-gray-600 mb-4">
              Create a new game room and become the host. You'll receive a unique 6-character
              room code that others can use to join your game.
            </Typography>

            {error && (
              <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box className="bg-indigo-50 rounded-2xl p-4 mb-4">
              <Typography variant="subtitle2" className="font-semibold text-indigo-900 mb-2">
                As Host, you can:
              </Typography>
              <ul className="text-sm text-indigo-700 space-y-1 ml-4">
                <li>Start and stop the game</li>
                <li>View all participants</li>
                <li>Monitor live leaderboard</li>
                <li>Export results as CSV</li>
              </ul>
            </Box>
          </Box>
        ) : (
          <Box className="text-center">
            <Box className="mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4 animate-bounce">
                <Typography variant="h4">🎉</Typography>
              </div>
              <Typography variant="h6" className="font-bold text-gray-800 mb-2">
                Room Created Successfully!
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Share this code with players
              </Typography>
            </Box>

            <Box className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-4 border-2 border-indigo-200">
              <Typography variant="caption" className="text-gray-600 block mb-2">
                Room Code
              </Typography>
              <Typography
                variant="h3"
                className="font-bold text-indigo-600 tracking-widest mb-3"
                sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}
              >
                {roomCode}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyCode}
                className={copied ? 'border-green-500 text-green-600' : ''}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </Box>

            <Alert severity="info" icon={false}>
              Players can join using this code from the "Join Room" page
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 3, sm: 4 }, pb: 3 }}>
        {!roomCode ? (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateRoom}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>Close</Button>
            <Button
              variant="contained"
              onClick={handleEnterRoom}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              Enter Room
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
