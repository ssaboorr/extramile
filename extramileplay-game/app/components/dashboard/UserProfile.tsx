'use client';

import { Card, CardContent, Typography, Avatar, Box, Chip } from '@mui/material';
import { User } from 'firebase/auth';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonIcon from '@mui/icons-material/Person';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const isAnonymous = user.isAnonymous;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h6" className="font-bold text-gray-800 mb-4">
          Profile
        </Typography>

        <Box className="flex flex-col items-center text-center mb-4">
          <Avatar
            src={user.photoURL || undefined}
            alt={user.displayName || 'User'}
            sx={{ width: 80, height: 80, mb: 2 }}
            className="border-4 border-indigo-100"
          >
            {user.displayName?.[0] || <PersonIcon sx={{ fontSize: 40 }} />}
          </Avatar>

          <Typography variant="h6" className="font-bold text-gray-800 mb-1">
            {user.displayName || 'Guest Player'}
          </Typography>

          {user.email && (
            <Typography variant="body2" className="text-gray-500 mb-2">
              {user.email}
            </Typography>
          )}

          <Chip
            icon={isAnonymous ? <PersonIcon /> : <VerifiedIcon />}
            label={isAnonymous ? 'Guest' : 'Verified'}
            size="small"
            color={isAnonymous ? 'default' : 'success'}
            className="mt-2"
          />
        </Box>

        <Box className="bg-gray-50 rounded-xl p-3 space-y-2">
          <div className="flex justify-between">
            <Typography variant="body2" className="text-gray-600">
              Games Played
            </Typography>
            <Typography variant="body2" className="font-semibold text-gray-800">
              0
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body2" className="text-gray-600">
              Best Score
            </Typography>
            <Typography variant="body2" className="font-semibold text-gray-800">
              --
            </Typography>
          </div>
        </Box>
      </CardContent>
    </Card>
  );
}
