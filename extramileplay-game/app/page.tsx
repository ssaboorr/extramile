'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Fade,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { auth } from '@/lib/firebase/config';
import { signOut } from './lib/firebase/auth/auth';
import RoomCard from '@/components/room/RoomCard';
import CreateRoomModal from '@/components/room/CreateRoomModal';
import JoinRoomModal from '@/components/room/JoinRoomModal';
import GameStats from '@/components/dashboard/GameStats';
import UserProfile from '@/components/dashboard/UserProfile';


export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(auth.currentUser);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null; // Show nothing while redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <Box
        component="header"
        className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200"
        sx={{ py: { xs: 2, sm: 3 } }}
      >
        <Container maxWidth="lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Typography
                  sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
                  className="font-bold text-white"
                >
                  🎮
                </Typography>
              </div>
              <div>
                <Typography
                  variant="h6"
                  className="font-bold text-gray-800"
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  ExtraMilePlay
                </Typography>
                <Typography
                  variant="caption"
                  className="text-gray-500 hidden sm:block"
                >
                  Challenge yourself and compete
                </Typography>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar
                src={user.photoURL || undefined}
                alt={user.displayName || 'User'}
                sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}
                className="border-2 border-indigo-200"
              >
                {user.displayName?.[0] || user.email?.[0] || '?'}
              </Avatar>
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} size="small">
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" className="relative z-10" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <Fade in timeout={800}>
          <div>
            {/* Welcome Section */}
            <Box className="text-center mb-8 sm:mb-12">
              <Typography
                variant="h3"
                className="font-bold text-gray-800 mb-3"
                sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
              >
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                  {user.displayName || 'Player'}
                </span>
                !
              </Typography>
              <Typography
                variant="h6"
                className="text-gray-600"
                sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }}
              >
                Ready to challenge yourself with some brain-teasing puzzles?
              </Typography>
            </Box>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <RoomCard
                title="Create Room"
                description="Start a new game room and invite friends to join the challenge"
                icon="🎯"
                gradient="from-indigo-500 to-purple-600"
                buttonText="Create New Room"
                onClick={() => setCreateModalOpen(true)}
              />
              <RoomCard
                title="Join Room"
                description="Enter a 6-character room code and compete with others"
                icon="🚀"
                gradient="from-pink-500 to-rose-600"
                buttonText="Join Existing Room"
                onClick={() => setJoinModalOpen(true)}
              />
            </div>

            {/* Stats & Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-8">
                <GameStats />
              </div>
              <div className="lg:col-span-4">
                <UserProfile user={user} />
              </div>
            </div>
          </div>
        </Fade>
      </Container>

      {/* Modals */}
      <CreateRoomModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <JoinRoomModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </div>
  );
}
