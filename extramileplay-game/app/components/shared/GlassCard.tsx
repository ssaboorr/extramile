'use client';

import { Card, CardContent, Box, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  elevation?: number;
  sx?: any;
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({ 
  children, 
  elevation = 0, 
  sx = {}, 
  onClick,
  hover = true 
}: GlassCardProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={elevation}
      onClick={onClick}
      sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        // borderRadius: Number(theme.shape.borderRadius) * 2,
        overflow: 'visible',
        cursor: onClick ? 'pointer' : 'default',
        transition: hover ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        '&:hover': hover ? {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        } : {},
        ...sx,
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
        {children}
      </CardContent>
    </Card>
  );
}
