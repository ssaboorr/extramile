'use client';

import { Typography, Box, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GlassCard from '@/components/shared/GlassCard';
import GlassButton from '@/components/shared/GlassButton';

interface RoomCardProps {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  buttonText: string;
  onClick: () => void;
}

export default function RoomCard({
  title,
  description,
  icon,
  gradient,
  buttonText,
  onClick,
}: RoomCardProps) {
  const theme = useTheme();

  return (
    <GlassCard onClick={onClick} hover={true}>
      {/* Gradient Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${gradient.includes('indigo') ? '#6366f1, #9333ea' : '#ec4899, #f43f5e'})`,
          p: { xs: 3, sm: 4 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          mb: 3,
          borderRadius: theme.shape.borderRadius,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 128,
            height: 128,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(64px, -64px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 96,
            height: 96,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(-48px, 48px)',
          }}
        />
        
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3rem' },
            mb: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {icon}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 700,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Card Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            minHeight: { sm: '48px' },
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>

        <GlassButton
          variant="contained"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={onClick}
        >
          {buttonText}
        </GlassButton>
      </Box>
    </GlassCard>
  );
}
