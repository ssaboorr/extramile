'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Fade,
  Zoom,
  Chip,
  Container,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PersonIcon from '@mui/icons-material/Person';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import { signInAsGuest, signInWithGoogle } from '@/lib/firebase/auth/auth';

export default function LoginForm() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingType, setLoadingType] = useState<'google' | 'guest' | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLoadingType('google');
    setError(null);

    try {
      await signInWithGoogle();
      router.push('/'); // Redirect to home/room selection
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setLoadingType('guest');
    setError(null);

    try {
      await signInAsGuest();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in as guest');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 50%, ${theme.palette.primary.dark} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Background Elements */}
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
            top: { xs: '20%', md: '25%' },
            left: { xs: '10%', md: '25%' },
            width: { xs: 200, sm: 300, md: 400 },
            height: { xs: 200, sm: 300, md: 400 },
            background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: 0.3,
            animation: 'blob 7s infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '30%', md: '35%' },
            right: { xs: '10%', md: '25%' },
            width: { xs: 200, sm: 300, md: 400 },
            height: { xs: 200, sm: 300, md: 400 },
            background: `linear-gradient(45deg, ${theme.palette.secondary.light}, ${theme.palette.primary.main})`,
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: 0.3,
            animation: 'blob 7s infinite 2s',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: '10%', md: '20%' },
            left: { xs: '20%', md: '30%' },
            width: { xs: 200, sm: 300, md: 400 },
            height: { xs: 200, sm: 300, md: 400 },
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: 0.3,
            animation: 'blob 7s infinite 4s',
          }}
        />
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, md: 4 },
        }}
      >
        {/* Login Card */}
        <Fade in timeout={800}>
          <Card
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 480 },
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              // borderRadius: Number(theme.shape.borderRadius) * ,
              overflow: 'visible',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              {/* Logo & Header */}
              <Zoom in timeout={1000}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    mb: 4,
                  }}
                >
                  {/* Logo */}
                  <Box
                    sx={{
                      position: 'relative',
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: Number(theme.shape.borderRadius) * 2,
                        filter: 'blur(10px)',
                        opacity: 0.7,
                        animation: 'pulse 2s infinite',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: { xs: 80, sm: 96 },
                        height: { xs: 80, sm: 96 },
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: Number(theme.shape.borderRadius) * 2,
                        boxShadow: theme.shadows[8],
                      }}
                    >
                      <SportsEsportsIcon
                        sx={{
                          fontSize: { xs: 36, sm: 44 },
                          color: 'white',
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                      textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    Some Game
                  </Typography>

                  {/* Subtitle */}
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 400,
                      mb: 3,
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                    }}
                  >
                    Challenge yourself. Compete globally.
                  </Typography>

                  {/* Feature Chips */}
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    {[
                      { icon: <SecurityIcon sx={{ fontSize: 16 }} />, label: 'Secure' },
                      { icon: <SpeedIcon sx={{ fontSize: 16 }} />, label: 'Fast' },
                      { icon: <EmojiEventsIcon sx={{ fontSize: 16 }} />, label: 'Competitive' },
                    ].map((chip, index) => (
                      <Chip
                        key={index}
                        icon={chip.icon}
                        label={chip.label}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          '& .MuiChip-icon': { color: 'white' },
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Zoom>

              {/* Error Alert */}
              {error && (
                <Fade in timeout={300}>
                  <Alert
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{
                      mb: 3,
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      backdropFilter: 'blur(10px)',
                      '& .MuiAlert-icon': { color: 'white' },
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Login Buttons */}
              <Stack spacing={3}>
                {/* Google Sign In */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={
                    loadingType === 'google' ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <GoogleIcon />
                    )
                  }
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  sx={{
                    height: { xs: 48, sm: 56 },
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: theme.palette.text.primary,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: theme.shape.borderRadius,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.5)',
                      color: 'rgba(31, 41, 55, 0.5)',
                    },
                  }}
                >
                  {loadingType === 'google' ? 'Signing in...' : 'Continue with Google'}
                </Button>

                {/* Divider */}
                {/* <Box sx={{ position: 'relative', my: 2 }}>
                  <Divider
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      '&::before, &::after': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'transparent',
                      px: 2,
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    }}
                  >
                    or
                  </Typography>
                </Box> */}

                {/* Guest Sign In */}
                {/* <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={
                    loadingType === 'guest' ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <PersonIcon />
                    )
                  }
                  onClick={handleGuestSignIn}
                  disabled={loading}
                  sx={{
                    height: { xs: 48, sm: 56 },
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    color: 'white',
                    borderRadius: theme.shape.borderRadius,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      border: '2px solid rgba(255, 255, 255, 0.6)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                    },
                    '&:disabled': {
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      color: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    },
                  }}
                >
                  {loadingType === 'guest' ? 'Signing in...' : 'Continue as Guest'}
                </Button> */}
              </Stack>

              {/* Footer
              <Box
                sx={{
                  mt: 4,
                  pt: 3,
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                    lineHeight: 1.5,
                  }}
                >
                  By continuing, you agree to our{' '}
                  <Box
                    component="span"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Terms of Service
                  </Box>{' '}
                  and{' '}
                  <Box
                    component="span"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Privacy Policy
                  </Box>
                </Typography>
              </Box> */}
            </CardContent>
          </Card>
        </Fade>

        {/* Features Section */}
        <Fade in timeout={1200}>
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 480 },
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: { xs: 2, sm: 3 },
            }}
          >
            {[
              { icon: '4', label: 'Brain Puzzles', color: theme.palette.primary.main },
              { icon: <EmojiEventsIcon sx={{ fontSize: 24 }} />, label: 'Live Rankings', color: theme.palette.secondary.main },
              { icon: <SpeedIcon sx={{ fontSize: 24 }} />, label: 'Real-time', color: '#ec4899' },
              { icon: <GroupIcon sx={{ fontSize: 24 }} />, label: 'Multiplayer', color: '#10b981' },
            ].map((feature, index) => (
              <Paper
                key={index}
                elevation={0}
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
                  cursor: 'pointer',
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
                    background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                    borderRadius: theme.shape.borderRadius,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    boxShadow: theme.shadows[2],
                  }}
                >
                  {typeof feature.icon === 'string' ? (
                    <Typography
                      sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                      }}
                    >
                      {feature.icon}
                    </Typography>
                  ) : (
                    feature.icon
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
                  {feature.label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
