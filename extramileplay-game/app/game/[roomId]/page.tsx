'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  ExitToApp as ExitIcon,
  People as PeopleIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { signOut } from '@/lib/firebase/auth/auth';
import AppBackground from '@/components/shared/AppBackground';
import AppHeader from '@/components/shared/AppHeader';
import GlassCard from '@/components/shared/GlassCard';
import GlassButton from '@/components/shared/GlassButton';
import GameSession from '@/components/game/GameSession';
import { doc, getDoc, onSnapshot, updateDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { leaveRoom } from '@/lib/firebase/collections';
import RoomLeaderboard from '@/components/game/RoomLeaderboard';

interface RoomPlayer {
  playerId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  joinedAt: any;
  totalScore: number;
  isHost: boolean;
}

interface RoomData {
  roomId: string;
  hostId: string;
  hostName: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  gameType: string;
  maxPlayers: number;
  currentPlayers: number;
  createdAt: any;
  startedAt?: any;
  endedAt?: any;
  settings: {
    timeLimit: number;
    difficulty: 'easy' | 'medium' | 'hard';
    allowSpectators: boolean;
    isPrivate: boolean;
  };
  results?: {
    winnerId: string;
    winnerName: string;
    topScores: Array<{
      playerId: string;
      playerName: string;
      score: number;
    }>;
  };
}

export default function GameRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [user, setUser] = useState<User | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!roomId || !user) return;

    // Listen to room data changes
    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribeRoom = onSnapshot(roomRef, async (doc) => {
      if (doc.exists()) {
        const data = doc.data() as RoomData;
        setRoomData(data);
        setGameStarted(data.status === 'active');
        setIsHost(data.hostId === user.uid);
        
        // Calculate time remaining if game is active
        if (data.status === 'active' && data.startedAt) {
          const startTime = data.startedAt.toDate();
          const timeLimit = data.settings.timeLimit * 60; // Convert to seconds
          const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
          const remaining = Math.max(0, timeLimit - elapsed);
          setTimeRemaining(remaining);
        }
        // If the room is active navigate to the playing screen
        if (data.status === 'active') {
          // If we're not already on the play route, navigate there
          const currentPath = window.location.pathname;
          if (!currentPath.endsWith('/play')) {
            router.push(`/game/${roomId}/play`);
          }
        }
      } else {
        router.push('/');
      }
    });

    // Listen to players in the room
    const playersRef = collection(db, 'rooms', roomId, 'players');
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      const playersData: RoomPlayer[] = [];
      snapshot.forEach((doc) => {
        playersData.push(doc.data() as RoomPlayer);
      });
      setPlayers(playersData.sort((a, b) => (b.isHost ? 1 : 0) - (a.isHost ? 1 : 0)));
    });

    setLoading(false);

    return () => {
      unsubscribeRoom();
      unsubscribePlayers();
    };
  }, [roomId, user, router]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - end the game
            handleEndGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, timeRemaining]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleStartGame = async () => {
    if (!roomId || !isHost) return;

    try {
      const roomRef = doc(db, 'rooms', roomId);
      // Fetch 3 game session templates and attach them to the room as sessions
      const templatesRef = collection(db, 'gameTemplates');
      const { getDocs } = await import('firebase/firestore');
      const templatesSnap = await getDocs(templatesRef);
      const templates: any[] = [];
      templatesSnap.forEach((t: any) => {
        const data = t.data();
        templates.push({ id: t.id, ...data });
      });

      // Prefer explicit easy/medium/hard templates when available
      const easy = templates.find(
        (t) =>
          t &&
          Array.isArray(t.challenges) &&
          t.challenges.length >= 4 &&
          (t.difficulty === 'easy' || (t.id || '').toLowerCase().includes('easy'))
      );
      const medium = templates.find(
        (t) =>
          t &&
          Array.isArray(t.challenges) &&
          t.challenges.length >= 4 &&
          (t.difficulty === 'medium' || (t.id || '').toLowerCase().includes('medium'))
      );
      const hard = templates.find(
        (t) =>
          t &&
          Array.isArray(t.challenges) &&
          t.challenges.length >= 4 &&
          (t.difficulty === 'hard' || (t.id || '').toLowerCase().includes('hard'))
      );

      const chosenTemplates = [easy, medium, hard].filter(Boolean) as any[];
      const chosen = chosenTemplates.map((t) => ({
        templateId: t.id,
        name: t.name || `Session - ${t.difficulty ?? 'mixed'}`,
        difficulty: t.difficulty || 'medium',
        totalTime: t.totalTime ?? null,
        maxScore: t.maxScore ?? null,
        challenges: (t.challenges || []).slice(0, 4),
      }));

      await updateDoc(roomRef, {
        status: 'active',
        startedAt: new Date(),
        sessions: chosen,
        currentSessionId: chosen[0]?.templateId ?? null,
        currentSessionIndex: 0,
        currentChallengeIndex: 0,
      });
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleEndGame = async () => {
    if (!roomId || !isHost) return;

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        status: 'completed',
        endedAt: new Date(),
      });
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  const handleLeaveRoom = async () => {
    setLoading(true);
    await leaveRoom(roomId, user?.uid || '');
    router.push('/');
    setLoading(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return theme.palette.warning.main;
      case 'active': return theme.palette.success.main;
      case 'completed': return theme.palette.info.main;
      case 'cancelled': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return theme.palette.grey[500];
    }
  };

  if (loading) {
    return (
      <AppBackground>
        <AppHeader user={user} onLogout={handleLogout} />
        <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: 'white' }}>
            Loading room...
          </Typography>
        </Container>
      </AppBackground>
    );
  }

  if (!roomData) {
    return (
      <AppBackground>
        <AppHeader user={user} onLogout={handleLogout} />
        <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: 'white' }}>
            Room not found
          </Typography>
          <GlassButton onClick={() => router.push('/')} sx={{ mt: 2 }}>
            Go Home
          </GlassButton>
        </Container>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <AppHeader 
        user={user} 
        onLogout={handleLogout}
        title={`Room ${roomId}`}
        subtitle={`${roomData.gameType} • ${roomData.settings.difficulty}`}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 4 }, transition: 'opacity 0.8s', opacity: 1 }}>
            
            {/* Room Status & Timer */}
            <GlassCard hover={false}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={roomData.status.toUpperCase()}
                    sx={{
                      backgroundColor: getStatusColor(roomData.status),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={roomData.settings.difficulty.toUpperCase()}
                    sx={{
                      backgroundColor: getDifficultyColor(roomData.settings.difficulty),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${roomData.currentPlayers}/${roomData.maxPlayers} Players`}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                    }}
                  />
                </Box>

                {gameStarted && timeRemaining > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimerIcon sx={{ color: theme.palette.warning.main }} />
                    <Typography
                      variant="h4"
                      sx={{
                        color: timeRemaining < 60 ? theme.palette.error.main : 'white',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatTime(timeRemaining)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Progress Bar for Game Time */}
              {gameStarted && timeRemaining > 0 && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(timeRemaining / (roomData.settings.timeLimit * 60)) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: timeRemaining < 60 ? theme.palette.error.main : theme.palette.warning.main,
                      },
                    }}
                  />
                </Box>
              )}
            </GlassCard>

            {/* Game Session */}
            {gameStarted && (
              <GameSession
                roomId={roomId}
                playerId={user?.uid || ''}
                onGameComplete={(results) => {
                  console.log('Game completed:', results);
                  // Handle game completion
                }}
              />
            )}

            {/* Players List */}
            <GlassCard hover={false}>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <PeopleIcon />
                Players ({players.length})
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {players.map((player) => (
                  <Box
                    key={player.playerId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: theme.shape.borderRadius,
                      border: player.isHost ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Avatar
                      src={player.photoURL}
                      sx={{
                        width: 40,
                        height: 40,
                        border: player.isHost ? `2px solid ${theme.palette.primary.main}` : 'none',
                      }}
                    >
                      {player.displayName[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                          }}
                        >
                          {player.displayName}
                        </Typography>
                        {player.isHost && (
                          <Chip
                            label="HOST"
                            size="small"
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.8rem',
                        }}
                      >
                        Score: {player.totalScore}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 3 }}>
                <RoomLeaderboard roomId={roomId} />
              </Box>
            </GlassCard>

            {/* Game Controls */}
            {isHost && (
              <GlassCard hover={false}>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    mb: 3,
                    textAlign: 'center',
                  }}
                >
                  Game Controls
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {!gameStarted ? (
                    <GlassButton
                      variant="contained"
                      startIcon={<PlayIcon />}
                      onClick={handleStartGame}
                      sx={{ minWidth: 160 }}
                    >
                      Start Game
                    </GlassButton>
                  ) : (
                    <GlassButton
                      variant="contained"
                      startIcon={<StopIcon />}
                      onClick={handleEndGame}
                      sx={{ minWidth: 160 }}
                    >
                      End Game
                    </GlassButton>
                  )}

                  <GlassButton
                    variant="outlined"
                    startIcon={<ExitIcon />}
                    onClick={handleLeaveRoom}
                    sx={{ minWidth: 160 }}
                  >
                    Leave Room
                  </GlassButton>
                </Box>
              </GlassCard>
            )}

            {/* Game Results */}
            {roomData.status === 'completed' && roomData.results && (
              <GlassCard hover={false}>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: 'center',
                  }}
                >
                  <TrophyIcon sx={{ color: '#fbbf24' }} />
                  Game Results
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {roomData.results.topScores.map((result, index) => (
                    <Box
                      key={result.playerId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        backgroundColor: index === 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: theme.shape.borderRadius,
                        border: index === 0 ? `2px solid #fbbf24` : '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: index === 0 ? '#fbbf24' : theme.palette.grey[600],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: 'white',
                          fontWeight: 600,
                          flex: 1,
                        }}
                      >
                        {result.playerName}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: index === 0 ? '#fbbf24' : 'white',
                          fontWeight: 700,
                        }}
                      >
                        {result.score}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </GlassCard>
            )}

            {/* Non-host controls */}
            {!isHost && (
              <GlassCard hover={false}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <GlassButton
                    variant="outlined"
                    startIcon={<ExitIcon />}
                    onClick={handleLeaveRoom}
                    sx={{ minWidth: 160 }}
                  >
                    Leave Room
                  </GlassButton>
                </Box>
              </GlassCard>
            )}
          </Box>
      </Container>
    </AppBackground>
  );
}
