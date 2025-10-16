'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { auth } from '@/lib/firebase/config';
import { signOut } from './lib/firebase/auth/auth';
import RoomCard from '@/components/room/RoomCard';
import CreateRoomModal from '@/components/room/CreateRoomModal';
import JoinRoomModal from '@/components/room/JoinRoomModal';
import GameStats from '@/components/dashboard/GameStats';
import UserProfile from '@/components/dashboard/UserProfile';
import AppBackground from '@/components/shared/AppBackground';
import AppHeader from '@/components/shared/AppHeader';


export default function HomePage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
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

  // return <div> {user.displayName || user.email|| '?'}</div>;

  return (
    <AppBackground>
      {/* Header */}
      <AppHeader 
        user={user} 
        onLogout={handleLogout}
        title="Some Game"
        subtitle="Challenge yourself and compete"
      />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 4, sm: 6, md: 8 }, transition: 'opacity 0.8s', opacity: 1 }}>
            {/* Welcome Section */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                  mb: 2,
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome back,{' '}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {user.displayName || 'Player'}
                </Box>
                !
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: { xs: '0.95rem', sm: '1.1rem' },
                  fontWeight: 400,
                }}
              >
                Ready to challenge yourself with some brain-teasing puzzles?
              </Typography>
            </Box>

            {/* Main Action Cards */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: { xs: 3, sm: 4 },
              }}
            >
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
            </Box>

            {/* Stats & Profile Section */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
                gap: { xs: 3, sm: 4 },
              }}
            >
              <GameStats />
              <UserProfile user={user} />
            </Box>
          </Box>
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
    </AppBackground>
  );
}
