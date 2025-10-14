'use client';

import { Typography, Box, useTheme } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import GlassCard from '@/components/shared/GlassCard';

export default function GameStats() {
  const theme = useTheme();
  
  const puzzles = [
    {
      icon: <PsychologyIcon sx={{ fontSize: 32 }} />,
      name: 'MCQ Trivia',
      color: '#3b82f6',
      description: 'Test your knowledge',
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 32 }} />,
      name: 'Emoji Puzzle',
      color: '#f59e0b',
      description: 'Decode the emojis',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 32 }} />,
      name: 'Reaction Test',
      color: '#10b981',
      description: 'Lightning fast reflexes',
    },
    {
      icon: <KeyboardIcon sx={{ fontSize: 32 }} />,
      name: 'Typing Sprint',
      color: '#8b5cf6',
      description: 'Type at light speed',
    },
  ];

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
        Game Challenges
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        {puzzles.map((puzzle, index) => (
          <Box
            key={index}
            sx={{
              background: `linear-gradient(135deg, ${puzzle.color}, ${puzzle.color}dd)`,
              borderRadius: Number(theme.shape.borderRadius) * 1.5,
              p: 3,
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: theme.shape.borderRadius,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {puzzle.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                >
                  {puzzle.name}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  }}
                >
                  {puzzle.description}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </GlassCard>
  );
}
