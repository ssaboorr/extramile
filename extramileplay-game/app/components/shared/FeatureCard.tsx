'use client';

import { 
  Paper, 
  Box, 
  Typography, 
  useTheme 
} from '@mui/material';
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode | string;
  label: string;
  color: string;
  onClick?: () => void;
}

export default function FeatureCard({ icon, label, color, onClick }: FeatureCardProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: { xs: 2, sm: 3 },
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: Number(theme.shape.borderRadius) * 1.5,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          borderRadius: theme.shape.borderRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          boxShadow: theme.shadows[2],
        }}
      >
        {typeof icon === 'string' ? (
          <Typography
            sx={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem',
            }}
          >
            {icon}
          </Typography>
        ) : (
          icon
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          fontWeight: 500,
          fontSize: { xs: '0.7rem', sm: '0.75rem' },
        }}
      >
        {label}
      </Typography>
    </Paper>
  );
}
