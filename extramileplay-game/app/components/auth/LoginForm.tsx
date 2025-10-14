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
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { signInAsGuest, signInWithGoogle } from '@/lib/firebase/auth/auth';

export default function LoginForm() {
  const router = useRouter();
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <Card 
        elevation={8}
        className="relative w-full max-w-md z-10"
        sx={{
          borderRadius: 3,
          overflow: 'visible',
        }}
      >
        <CardContent className="p-6 sm:p-8 lg:p-10">
          {/* Logo & Header */}
          <Box className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
              <SportsEsportsIcon 
                sx={{ fontSize: { xs: 32, sm: 40 }, color: 'white' }} 
              />
            </div>
            
            <Typography
              variant="h4"
              component="h1"
              className="font-bold text-gray-800 mb-2"
              sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
            >
              ExtraMilePlay
            </Typography>
            
            <Typography
              variant="body1"
              className="text-gray-600"
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              Join the challenge and compete!
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              className="mb-4"
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
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
              className="bg-white hover:bg-gray-50 text-gray-700 shadow-md"
              sx={{
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                  border: '1px solid #d1d5db',
                },
                py: 1.5,
                fontSize: { xs: '0.95rem', sm: '1rem' },
              }}
            >
              {loadingType === 'google' ? 'Signing in...' : 'Continue with Google'}
            </Button>

            {/* Divider */}
            <Divider className="my-4">
              <Typography 
                variant="body2" 
                className="text-gray-500 px-2"
                sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
              >
                or
              </Typography>
            </Divider>

            {/* Guest Sign In */}
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={
                loadingType === 'guest' ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <PersonOutlineIcon />
                )
              }
              onClick={handleGuestSignIn}
              disabled={loading}
              sx={{
                borderWidth: 2,
                py: 1.5,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              {loadingType === 'guest' ? 'Signing in...' : 'Continue as Guest'}
            </Button>
          </Stack>

          {/* Footer */}
          <Box className="mt-6 pt-6 border-t border-gray-200">
            <Typography
              variant="caption"
              className="text-gray-500 text-center block"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
            >
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Features Section - Hidden on Mobile */}
      <div className="hidden lg:block absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
              <Typography className="text-indigo-600 font-bold text-xl">4</Typography>
            </div>
            <Typography variant="caption" className="text-gray-600">Puzzles</Typography>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-2">
              <Typography className="text-pink-600 font-bold text-xl">🏆</Typography>
            </div>
            <Typography variant="caption" className="text-gray-600">Live Leaderboard</Typography>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <Typography className="text-purple-600 font-bold text-xl">⚡</Typography>
            </div>
            <Typography variant="caption" className="text-gray-600">Real-time</Typography>
          </div>
        </div>
      </div>
    </div>
  );
}
