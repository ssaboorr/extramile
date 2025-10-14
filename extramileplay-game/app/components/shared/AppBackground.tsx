'use client';

import { Box, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface AppBackgroundProps {
  children: ReactNode;
  showOrbs?: boolean;
}

export default function AppBackground({ children, showOrbs = true }: AppBackgroundProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 50%, ${theme.palette.primary.dark} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Elements */}
      {showOrbs && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          {/* Animated gradient orbs */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: '10%', md: '5%' },
              right: { xs: '5%', md: '10%' },
              width: { xs: 200, sm: 300, md: 400 },
              height: { xs: 200, sm: 300, md: 400 },
              background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
              borderRadius: '50%',
              mixBlendMode: 'multiply',
              filter: 'blur(40px)',
              opacity: 0.2,
              animation: 'blob 7s infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: '5%', md: '10%' },
              left: { xs: '5%', md: '10%' },
              width: { xs: 200, sm: 300, md: 400 },
              height: { xs: 200, sm: 300, md: 400 },
              background: `linear-gradient(45deg, ${theme.palette.secondary.light}, ${theme.palette.primary.main})`,
              borderRadius: '50%',
              mixBlendMode: 'multiply',
              filter: 'blur(40px)',
              opacity: 0.2,
              animation: 'blob 7s infinite 2s',
            }}
          />
        </Box>
      )}

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
