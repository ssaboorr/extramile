'use client';

import { Typography, Avatar, Box, Chip, useTheme } from '@mui/material';
import { User } from 'firebase/auth';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonIcon from '@mui/icons-material/Person';
import GlassCard from '@/components/shared/GlassCard';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const theme = useTheme();
  const isAnonymous = user.isAnonymous;

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
          borderRadius: Number(theme.shape.borderRadius) * 1.5,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
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
            0
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
          <Typography 
            variant="body2" 
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
            }}
          >
            --
          </Typography>
        </Box>
      </Box>
    </GlassCard>
  );
}
