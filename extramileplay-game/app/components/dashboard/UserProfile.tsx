'use client';

import { Typography, Avatar, Box, Chip, useTheme, Skeleton } from '@mui/material';
import { User } from 'firebase/auth';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GlassCard from '@/components/shared/GlassCard';
import { usePlayer } from '@/lib/hooks/usePlayer';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const theme = useTheme();
  const isAnonymous = user.isAnonymous;
  const { playerData, loading, error } = usePlayer(user);

  return (
    <GlassCard hover={false}>
      <Typography 
        variant="h6" 
        sx={{
          color: 'white',
          fontWeight: 700,
          mb: 3,
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
        }}
      >
        Profile
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
        <Avatar
          src={user.photoURL || undefined}
          alt={user.displayName || 'User'}
          sx={{ 
            width: 80, 
            height: 80, 
            mb: 2,
            border: '4px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {user.displayName?.[0] || <PersonIcon sx={{ fontSize: 40 }} />}
        </Avatar>

        <Typography 
          variant="h6" 
          sx={{
            color: 'white',
            fontWeight: 700, 
            mb: 1,
            fontSize: { xs: '1rem', sm: '1.1rem' },
          }}
        >
          {user.displayName || 'Guest Player'}
        </Typography>

        {user.email && (
          <Typography 
            variant="body2" 
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 2,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
            }}
          >
            {user.email}
          </Typography>
        )}

        <Chip
          icon={isAnonymous ? <PersonIcon sx={{ fontSize: 16 }} /> : <VerifiedIcon sx={{ fontSize: 16 }} />}
          label={isAnonymous ? 'Guest' : 'Verified'}
          size="small"
          sx={{
            backgroundColor: isAnonymous ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)',
            color: 'white',
            border: `1px solid ${isAnonymous ? 'rgba(255, 255, 255, 0.2)' : 'rgba(34, 197, 94, 0.3)'}`,
            '& .MuiChip-icon': { color: 'white' },
            fontSize: { xs: '0.7rem', sm: '0.8rem' },
          }}
        />
      </Box>

      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          // borderRadius: Number(theme.shape.borderRadius) * 1.5,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {loading ? (
          // Loading skeletons
          <>
            {[...Array(4)].map((_, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                <Skeleton variant="text" width="30%" height={20} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              </Box>
            ))}
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                }}
              >
                Level
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                <Typography 
                  variant="body2" 
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  }}
                >
                  {playerData?.level || 1}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                }}
              >
                Games Played
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                }}
              >
                {playerData?.totalGamesPlayed || 0}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                }}
              >
                Best Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                <Typography 
                  variant="body2" 
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  }}
                >
                  {playerData?.bestScore || 0}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                }}
              >
                Win Rate
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                }}
              >
                {playerData ? `${playerData.winRate.toFixed(1)}%` : '0%'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                }}
              >
                Current Streak
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                }}
              >
                {playerData?.currentStreak || 0}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </GlassCard>
  );
}
