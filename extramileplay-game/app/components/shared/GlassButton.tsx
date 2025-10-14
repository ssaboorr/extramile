'use client';

import { Button, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface GlassButtonProps {
  children: ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  sx?: any;
  type?: 'submit' | 'button' | 'reset';
}

export default function GlassButton({
  children,
  variant = 'contained',
  size = 'large',
  fullWidth = false,
  startIcon,
  endIcon,
  disabled = false,
  loading = false,
  onClick,
  sx = {},
  type = 'button',
}: GlassButtonProps) {
  const theme = useTheme();

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: theme.shape.borderRadius,
      fontSize: { xs: '1rem', sm: '1.1rem' },
      fontWeight: 600,
      textTransform: 'none' as const,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      height: { xs: 48, sm: 56 },
      '&:hover': {
        transform: 'translateY(-2px)',
      },
      '&:active': {
        transform: 'translateY(0px)',
      },
    };

    if (variant === 'contained') {
      return {
        ...baseStyles,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        color: theme.palette.text.primary,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: theme.shadows[4],
        '&:hover': {
          ...baseStyles['&:hover'],
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          boxShadow: theme.shadows[8],
        },
        '&:disabled': {
          background: 'rgba(255, 255, 255, 0.5)',
          color: 'rgba(31, 41, 55, 0.5)',
        },
      };
    }

    if (variant === 'outlined') {
      return {
        ...baseStyles,
        border: '2px solid rgba(255, 255, 255, 0.4)',
        color: 'white',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          ...baseStyles['&:hover'],
          border: '2px solid rgba(255, 255, 255, 0.6)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: theme.shadows[4],
        },
        '&:disabled': {
          border: '2px solid rgba(255, 255, 255, 0.2)',
          color: 'rgba(255, 255, 255, 0.5)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        },
      };
    }

    return baseStyles;
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      startIcon={loading ? undefined : startIcon}
      endIcon={endIcon}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      sx={{
        ...getButtonStyles(),
        ...sx,
      }}
    >
      {loading ? 'Loading...' : children}
    </Button>
  );
}
